import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { checkViesServiceAvailable, validateVatNumber } from '../src/index'
import { EU_COUNTRIES } from '../src/types'

function randomElement<T>(input: Array<T>): T {
    return input[Math.floor(Math.random() * FORTUNE_100_EU_COMPANIES.length)]
}

interface Company {
    name?: string
    countryCode: string
    vatNumber: string
}

const FORTUNE_100_EU_COMPANIES: Company[] = [
    {
        name: 'DHL Express',
        countryCode: 'DE',
        vatNumber: '814145736'
    },
    {
        name: 'AbbVie AB',
        countryCode: 'SE',
        vatNumber: '556887565101'
    },
    {
        name: 'Hilti Netherlands',
        countryCode: 'NL',
        vatNumber: '006181338B01'
    },
    {
        name: 'Hilton S.L.',
        countryCode: 'ES',
        vatNumber: 'B28061976'
    },
    {
        name: 'Cisco Systems Danmark',
        countryCode: 'DK',
        vatNumber: '20456078'
    },
]


describe('VAT valitator detects VALID as expected', () => {

    const randomValidCompany = randomElement(FORTUNE_100_EU_COMPANIES)

    console.log('Chosen Valid Company')
    console.log(randomValidCompany)

    test('Valid with full response', async() => {
        const result = await validateVatNumber(randomValidCompany.countryCode, randomValidCompany.vatNumber)

        assert.ok(result.valid)
    }),
    test('Valid with boolean response', async() => {
        const result = await validateVatNumber(randomValidCompany.countryCode, randomValidCompany.vatNumber, { fullResponse: false })

        assert.ok(result)
    })

})

describe('VAT valitator detects NOT VALID as expected', () => {

    const randomNotValidCompany: Company = {
        countryCode: randomElement(EU_COUNTRIES),
        vatNumber: '123456789'
    }

    console.log('Chosen Not Valid Company')
    console.log(randomNotValidCompany)

    test('Not valid with full response', async() => {
        const result = await validateVatNumber(randomNotValidCompany.countryCode, randomNotValidCompany.vatNumber)

        console.log(result)

        assert.ok(!result.valid)
    }),
    test('Not valid with boolean response', async() => {
        const result = await validateVatNumber(randomNotValidCompany.countryCode, randomNotValidCompany.vatNumber, { fullResponse: false })

        assert.ok(!result)
    })
    
})

describe('Service Available', () => {
    test('Member State Available', async() => {
        const result = await checkViesServiceAvailable('DE')
        assert.ok(result)
    })
})

describe('Invalid country code input validation', () => {
    
    test('Exception on invalid country input', async () => {
        
        await assert.rejects(
            async () => {
                await validateVatNumber('XX', '123456789')
            },
            {
                name: 'VatValidationError',
                message: /Country code 'XX' is not supported/
            }
        )

        await assert.rejects(
            async () => {
                await validateVatNumber('US', '123456789')
            },
            {
                name: 'VatValidationError',
                message: /Country code 'US' is not supported/
            }
        )

        await assert.rejects(
            async () => {
                await checkViesServiceAvailable('XX')
            },
            {
                name: 'VatValidationError',
                message: /Country code 'XX' is not supported/
            }
        )
    })

    test('Validation pass on lowecase country code', async() => {


        const randomNotValidCompany: Company = {
            countryCode: randomElement(EU_COUNTRIES).toLowerCase(),
            vatNumber: '123456789'
        }

        const result = await validateVatNumber(randomNotValidCompany.countryCode, randomNotValidCompany.vatNumber)

        assert.ok(!result.valid)
    })
})