import { 
    Country, 
    VatClientConfig, 
    VatErrorResponse, 
    VatValidationError, 
    VatValidationRequest, 
    VatValidationResponse 
} from "./types"

const DEFAULT_CONFIG: Required<VatClientConfig> = {
    timeout: 10000,
    retryDelay: 1000,
    returnFullResponse: true,
}

const BASE_URL = 'https://ec.europa.eu/taxation_customs/vies/rest-api/check-vat-number'

export class VatClient {
    private config: Required<VatClientConfig>

    constructor(config?: VatClientConfig) {
        this.config = { ...DEFAULT_CONFIG, ...config }
    }

    async validate(countryCode: Country, vatNumber: string): Promise<VatValidationResponse | boolean> {
        const request: VatValidationRequest = {
            countryCode,
            vatNumber
        }

        let lastErrorResponse: VatErrorResponse | null = null
        const startTime = Date.now()

        while (Date.now() - startTime < this.config.timeout) {
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
                
                if (this.config.returnFullResponse) {
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
            lastErrorResponse = await response.json() as VatErrorResponse
            
            if (Date.now() - startTime < this.config.timeout) {
                await this.sleep(this.config.retryDelay)
                continue
            }
            
        }

        const errorMessage = lastErrorResponse 
            ? `${lastErrorResponse.errorWrappers[0]?.error}: ${lastErrorResponse.errorWrappers[0]?.message}`
            : 'Request timeout'
        throw new VatValidationError(errorMessage)
    }


    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
}

export async function validateVatNumber(
    countryCode: Country,
    vatNumber: string,
    config?: VatClientConfig
): Promise<VatValidationResponse | boolean> {
    const client = new VatClient(config)
    return client.validate(countryCode, vatNumber)
}