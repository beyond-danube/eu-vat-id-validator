export const EU_COUNTRIES = [
    'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'EL', 'ES', 'FI', 'FR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK', 'XI'

]

export interface VatValidationResponse {
    countryCode: string
    vatNumber: string
    requestDate: string
    valid: boolean
    name?: string
    address?: string
}

/**
 * Configuration options for VAT validation
 */
export interface ValidationOptions {
    /** 
     * Request timeout in milliseconds 
     * @default 10000 
     */
    timeout?: number
    
    /** 
     * Delay between retry attempts in milliseconds 
     * @default 1000 
     */
    retryDelay?: number
    
    /** 
     * Whether to return the full validation response object or just a boolean
     * - `true`: Returns VatValidationResponse object with all details
     * - `false`: Returns boolean indicating validity
     * @default true 
     */
    fullResponse?: boolean
}

export interface ViesError {
    actionSucceed: boolean
    errorWrappers: {
        error: string
        message: string
    }[]
}

export interface StatusCheckResponse {
    vow: {
        available: boolean
    },
    countries: {
        countryCode: string
        availability: string
    }[]
}

export class VatValidationError extends Error {

    errorDetails?: ViesError

    constructor(message: string, errorDetails?: ViesError) {
        super(message)
        this.name = 'VatValidationError'
        this.errorDetails = errorDetails
        Object.setPrototypeOf(this, VatValidationError.prototype);
    }
}