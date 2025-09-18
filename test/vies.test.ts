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

    test('With full response', async() => {
        const result = await validateVatNumber(randomValidCompany.countryCode, randomValidCompany.vatNumber)

        assert.ok(result.valid)
    }),
    test('With boolean response', async() => {
        const result = await validateVatNumber(randomValidCompany.countryCode, randomValidCompany.vatNumber, { fullResponse: false })

        assert.ok(result)
    })

})

describe('VAT valitator detects NOT VALID as expected', () => {

    const randomNotValidCompany: Company = {
        countryCode: randomElement(EU_COUNTRIES),
        vatNumber: '123456789'
    }

    test('With full response', async() => {
        const result = await validateVatNumber(randomNotValidCompany.countryCode, randomNotValidCompany.vatNumber)

        assert.ok(!result.valid)
    }),
    test('With boolean response', async() => {
        const result = await validateVatNumber(randomNotValidCompany.countryCode, randomNotValidCompany.vatNumber, { fullResponse: false })

        assert.ok(!result)
    })
    
})