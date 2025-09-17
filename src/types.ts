export type Country = 
'AT' | 'BE' | 'BG' | 'CY' | 'CZ' | 'DE' | 'DK' | 'EE' | 'EL' | 'ES' | 'FI' | 'FR' | 'HR' | 'HU' | 'IE' | 'IT' | 'LT' | 'LU' | 'LV' | 'MT' | 'NL' | 'PL' | 'PT' | 'RO' | 'SE' | 'SI' | 'SK' | 'XI'

export interface VatValidationRequest {
    countryCode: string
    vatNumber: string  
}

export interface VatValidationResponse {
    countryCode: string
    vatNumber: string
    requestDate: string
    valid: boolean
    name?: string
    address?: string
}

export interface VatErrorResponse {
    actionSucceed: boolean
    errorWrappers: Array<{
        error: string
        message: string
    }>
}

export interface VatClientConfig {
    timeout?: number
    retryDelay?: number
    returnFullResponse?: boolean
}

export class VatValidationError extends Error {
    constructor(message: string, public statusCode?: number) {
        super(message)
        this.name = 'VatValidationError'
    }
}