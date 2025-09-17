import { 
    EU_COUNTRIES,
    ValidationOptions, 
    VatValidationError, 
    VatValidationResponse 
} from "./types"

const DEFAULT_CONFIG: Required<ValidationOptions> = {
    timeout: 10000,
    retryDelay: 1000,
    fullResponse: true,
}

const BASE_URL = 'https://ec.europa.eu/taxation_customs/vies/rest-api/check-vat-number'

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export async function validateVatNumber(countryCode: string, vatNumber: string): Promise<VatValidationResponse>
export async function validateVatNumber(countryCode: string, vatNumber: string, options: ValidationOptions & { fullResponse: false }): Promise<boolean>
export async function validateVatNumber(countryCode: string, vatNumber: string, options: ValidationOptions & { fullResponse?: true }): Promise<VatValidationResponse>
export async function validateVatNumber(countryCode: string, vatNumber: string, options?: ValidationOptions): Promise<VatValidationResponse | boolean>

// Implementation
export async function validateVatNumber(
    countryCode: string,
    vatNumber: string,
    options?: ValidationOptions
): Promise<VatValidationResponse | boolean> {
    const config = { ...DEFAULT_CONFIG, ...options }
    
    // Validate country code against supported countries
    if (!(EU_COUNTRIES as readonly string[]).includes(countryCode)) {
        throw new VatValidationError(`Country code '${countryCode}' is not supported. Supported countries: ${EU_COUNTRIES.join(', ')}`)
    }
    
    const request = {
        countryCode: countryCode,
        vatNumber: vatNumber
    }

    let lastErrorMessage = `Request timeout, waited for succsess: ${config.timeout} ms`
    const startTime = Date.now()

    while (Date.now() - startTime < config.timeout) {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(request)
        })

        if (response.ok) {
            const apiResponse = await response.json()
            
            if (config.fullResponse) {
                // Return only the fields defined in VatValidationResponse
                const result: VatValidationResponse = {
                    countryCode: apiResponse.countryCode,
                    vatNumber: apiResponse.vatNumber,
                    requestDate: apiResponse.requestDate,
                    valid: apiResponse.valid,
                    ...(apiResponse.name && { name: apiResponse.name }),
                    ...(apiResponse.address && { address: apiResponse.address })
                }
                return result
            }
            
            return apiResponse.valid
        } 
        
        const errorResponse = await response.json()
        lastErrorMessage = errorResponse
        
        if (Date.now() - startTime < config.timeout) {
            await sleep(config.retryDelay)
            continue
        }
        
        break
    }

    throw new VatValidationError(lastErrorMessage)
}