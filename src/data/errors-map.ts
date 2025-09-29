export const ERRORS_MAP = {
    INVALID_INPUT: "Some data are invalid in the request.",
    VAT_BLOCKED: "The VAT number is blocked due to a specific filter on this number.",
    MS_MAX_CONCURRENT_REQ: "The request has been rejected because the maximum concurrent request for this Member State has been reached. Please retry later on.",
    GLOBAL_MAX_CONCURRENT_REQ: "The request has been rejected because the maximum concurrent request for the application has been reached. Please retry later on.",
    MS_UNAVAILABLE: "The request has been processed but the Member State service to validate the request is unavailable. Please retry later on.",
    TIMEOUT: "The request has been processed but the Member State service did not answer in the expected time."
}