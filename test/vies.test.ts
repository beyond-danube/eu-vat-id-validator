import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { validateVatNumber } from '../src/index.js'
import { EU_COUNTRIES } from '../src/types.js'

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
    }
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