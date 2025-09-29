import { 
    EU_COUNTRIES,
    StatusCheckResponse,
    ValidationOptions, 
    VatValidationError, 
    VatValidationResponse, 
    ViesError
} from "./types"

const DEFAULT_CONFIG: Required<ValidationOptions> = {
    timeout: 2000,
    retryDelay: 100,
    fullResponse: true,
}

const BASE_URL = 'https://ec.europa.eu/taxation_customs/vies/rest-api/check-vat-number'
const BASE_URL_CHECK = 'https://ec.europa.eu/taxation_customs/vies/rest-api/check-status'

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function combineErrorMessageAndError(message: string, errorDetails: ViesError) {
    let errorDetailsMessage = ''

    for (const errorWrapper of errorDetails.errorWrappers) {
        errorDetailsMessage += `${errorWrapper.error}: ${errorWrapper.message}\n`
    }

    return `${message}\n\n${errorDetailsMessage}`
}

function validateCountryInput(countryCode: string) {
    // Validate country code against supported countries
    if (!EU_COUNTRIES.includes(countryCode.toUpperCase())) {
        throw new VatValidationError(`Country code '${countryCode}' is not supported.\nSupported countries: ${EU_COUNTRIES.join(', ')}`)
    }
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
    
    validateCountryInput(countryCode)
    
    const request = {
        countryCode: countryCode,
        vatNumber: vatNumber
    }

    let lastErrorMessage = `Request timeout, waited for succsess: ${config.timeout} ms`
    let lastError: ViesError | undefined
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

            if(apiResponse.actionSucceed !== undefined && apiResponse.actionSucceed === false) {
                lastErrorMessage = combineErrorMessageAndError("Vies returned status code OK, but with error", apiResponse)
                lastError = apiResponse
                continue
            }
            
            if (config.fullResponse) {
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
        
        lastError = await response.json() as ViesError
        lastErrorMessage = combineErrorMessageAndError(`Vies returned error with status code: ${response.status}`, lastError)
        
        if (Date.now() - startTime < config.timeout) {
            await sleep(config.retryDelay)
            continue
        }
        
        break
    }

    throw new VatValidationError(lastErrorMessage, lastError)
}

export async function checkViesServiceAvailable(countryCode: string): Promise<boolean> {

    validateCountryInput(countryCode)

    const response = await fetch(BASE_URL_CHECK)

    if(!response.ok) {
        return false
    }

    const apiResponse = await response.json() as StatusCheckResponse

    if(!apiResponse.vow.available) {
        return false
    }

    return apiResponse.countries.find(entry => entry.countryCode === countryCode)?.availability === 'Available'
}