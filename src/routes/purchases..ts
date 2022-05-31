import { Request, Response, Router } from 'express'
import Reports from '../App/Reports'
const router = Router()
import purchasesJson from '../compras.json'
import salesJson from '../vendas.json'

router.get('/dashboard', (request: Request, res: Response) => {
  try {
    const sales = salesJson ? salesJson: []
    const purchases =  purchasesJson ? purchasesJson: []
    const reports = new Reports()
    reports
      .on('SUCCESS', (data: unknown) => res.json(data))
      .on('VALIDATION_ERROR', (error: unknown) => res.status(409).json(error))
      .on('ERROR', (response: unknown) => res.status(500).json(response))

    return reports.execute(sales,purchases)
  } catch (error) {
    return res.status(500).json(error)
  }
})
export default router
