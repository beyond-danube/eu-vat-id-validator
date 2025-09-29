import { ERRORS_MAP } from "./data/errors-map"

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
     * @default 2000 
     */
    timeout?: number
    
    /** 
     * Delay between retry attempts in milliseconds 
     * @default 100 
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
        message?: string
    }[]
}

export interface StatusCheckResponse {
    vow: {
        available: boolean
    },
    countries: {
        countryCode: string
        availability: 'Unavailable' | 'Available'
    }[]
}

export class VatValidationError extends Error {

    errorDetails?: ViesError

    constructor(message: string, errorDetails?: ViesError) {
        super(message)
        this.name = 'VatValidationError'
        this.errorDetails = errorDetails

        if(this.errorDetails?.errorWrappers) {
            for (const errorWrapper of this.errorDetails.errorWrappers) {
                if(!errorWrapper.message) {
                    errorWrapper.message = ERRORS_MAP[errorWrapper.error as keyof typeof ERRORS_MAP] ?? 'n/a'
                }
            }
        }

        Object.setPrototypeOf(this, VatValidationError.prototype);
    }
}