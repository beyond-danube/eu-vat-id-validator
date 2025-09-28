# EU VAT ID Validator
Lbrary for EU VAT number validation. Wrapper for [REST service provided by EU](https://ec.europa.eu/taxation_customs/vies/#/technical-information).  

Zero dependency library, relies only on node fetch.

## Getting Started
Install dependency
```bash
npm install eu-vat-id-validator
```
Check if Member State information is available
```typescript
(async () => {

    const isMemberStateAvailable = await checkViesServiceAvailable('DE')
    console.log(isMemberStateAvailable)

})()
```
Check VAT number is valid
```typescript
(async () => {

    const isVatNumberValid = await validateVatNumber('DE', '123456789')
    console.log(isVatNumberValid)

})()
```
## Options
Return only boolean if VAT number is valid or not, without additional information
```typescript
(async () => {

    const isVatNumberValid = await validateVatNumber('DE', '123456789', { fullResponse: false })
    console.log(isVatNumberValid)

})()
```
## Retry Strategy
REST service provided by EU sometimes fails to validates due to different circumstances.  

There is also logic inside the service, that can return succsesfull status code, while not providing actual result, case is that request is technically processed correctly, while but returns error.  

Library handles this case with configurable retry. Defaults to 2 secondns of total retry with 100 milliseconds polling interval.
```typescript
(async () => {

    const isVatNumberValid = await validateVatNumber('DE', '123456789', { fullResponse: false, retryDelay: 500, timeout: 10000 })
    console.log(isVatNumberValid)

})()
```
## Error Handling
In case after all retries library will not return results, it will throw `VatValidationError` providing all additional information about a cause.  

Handling is based on [documentation provided](https://taxation-customs.ec.europa.eu/document/13d951e7-822a-40b4-a0df-ea6dc94b7fbb_en).

In case VIES provided details, they will be accecible in `error.errorDetails`
```typescript
(async () => {
    try {
        await validateVatNumber('PD', '123456789', { fullResponse: false });
    } catch (error) {
        if (error instanceof VatValidationError) {
            console.warn(`VatValidationError: ${error.message}\n`);
            console.warn(error.errorDetails)
        } else {
            console.warn(`Unexpected error: ${error}\n`);
        }
    }
})()
```

## Use-case
The most direct use case if covered, which is actually validate EU VAT ID.  

In case of more exact use-cases or issue discovered, feel free to [report an issue](https://github.com/beyond-danube/eu-vat-id-validator/issues)
