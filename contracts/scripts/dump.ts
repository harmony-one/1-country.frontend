import dotenv from 'dotenv'
import fs from 'fs/promises'
import { ethers } from 'hardhat'
import { Interface } from 'ethers/lib/utils'

dotenv.config({ path: '.env.dump' })

const NAMES: string[] = JSON.parse(process.env.NAMES || '[]')
const CONTRACT = process.env.CONTRACT || '0x0Ad7c7766aA67B46e4ba6Fd2905531fBE62c8Fc5'
const OUT = process.env.OUT || 'dump.json'
const ABI_FILE = process.env.ABI_FILE || './archive/D1DC_old.json'

async function main () {
  const abi = await fs.readFile(ABI_FILE, { encoding: 'utf-8' })
  const signer = await ethers.getNamedSigner('deployer')
  const c = new ethers.Contract(CONTRACT, new Interface(abi), signer)
  const records: {name:string, key: string, record: any[]}[] = []
  for (let i = 0; i < NAMES.length; i++) {
    const key = ethers.utils.id(NAMES[i])
    const record = await c.nameRecords(key)
    const [renter, timeUpdated, price, url] = record
    records.push({ name: NAMES[i], key, record: [renter, timeUpdated, price.toString(), url] })
  }
  if (!OUT) {
    records.forEach(console.log)
    return
  }
  await fs.writeFile(OUT, JSON.stringify(records))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})