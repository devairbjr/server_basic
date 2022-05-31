// import EventEmitter from 'events';
import { EventEmitter } from 'events';
import { TypePurchase, TypeSale } from './types'
import moment from 'moment'
import _ from 'lodash'

export default class Reports extends EventEmitter {
  async execute(sales, purchases) {
    try {
      let balance = []
      let balanceDetails = []
      const { countSale, arraySaleYear } = await this.arrayConvertSaleYear(
        sales,
      )
      const {
        countPurchase,
        countIcms,
        countSt,
        arrayPurchaseYear,
      } = await this.arrayConvertPurchaseYear(purchases)

      const countSaleYear = _(arraySaleYear)
        .groupBy('data')
        .map((sale, year) => ({
          year: year,
          amount: _.sumBy(sale, 'total'),
        }))
        .value()

      const countPurchaseYear = _(arrayPurchaseYear)
        .groupBy('data')
        .map((purchase, year) => ({
          year: year,
          st: _.sumBy(purchase, 'ST'),
          icms: _.sumBy(purchase, 'ICMS'),
          amount: _.sumBy(purchase, 'total'),
        }))
        .value()

      countPurchaseYear.forEach((purchase, index) => {
        const sale = countSaleYear[index]
        const totalSaldo = this.getTotalSaldo(countPurchaseYear, countSaleYear)
        const saldo = purchase.amount - sale.amount
        const porcentagem = this.getPorcentagem(totalSaldo, saldo)
        balance.push({
          ano: purchase.year,
          saldo: String('R$ ' + saldo.toFixed(4)),
          porcentagem,
        })
        balanceDetails.push({
          ano: purchase.year,
          compras: purchase.amount,
          vendas: countSaleYear[index].amount,
          icms: purchase.icms,
          st: purchase.st,
        })
      })

      const tags = [
        { tag: 'COMPRAS', valor: 'R$ ' + countPurchase },
        { tag: 'VENDAS', valor: 'R$ ' + countSale },
        { tag: 'ICMS', valor: 'R$ ' + countIcms },
        { tag: 'ST', valor: 'R$ ' + countSt },
      ]

      return this.emit('SUCCESS', {
        data: {
          tags,
          balance,
          balanceDetails
        },
      })
    } catch (error) {
      return this.emit('ERROR', error)
    }
  }
  async arrayConvertSaleYear(sales: any) {
    let countSale = 0
    const arraySaleYear = []
    for (const sale of sales) {
      countSale += sale?.total
      arraySaleYear.push(await this.convertDateSale(sale))
    }
    return {
      countSale,
      arraySaleYear,
    }
  }
  async arrayConvertPurchaseYear(purchases: any) {
    let countPurchase = 0
    let countIcms = 0
    let countSt = 0
    const arrayPurchaseYear = []
    for (const purchase of purchases) {
      countIcms += purchase?.ICMS
      countPurchase += purchase?.total
      countSt += purchase?.ST
      arrayPurchaseYear.push(await this.convertDatePurchase(purchase))
    }

    return {
      countIcms,
      countPurchase,
      countSt,
      arrayPurchaseYear,
    }
  }
  async convertDateSale(sale: TypeSale) {
    let date = sale.data
    let year = moment(date, 'MM/YYYY').year()
    let newSale = {
      ...sale,
    }
    newSale.data = String(year)
    return newSale
  }
  async convertDatePurchase(purchase: TypePurchase) {
    let date = purchase.data
    let year = moment(date, 'MM/YYYY').year()
    let newPurchase = {
      ...purchase,
    }
    newPurchase.data = String(year)
    return newPurchase
  }
  getTotalSaldo(totalSaleYear, totalPurchaseYear) {
    let totalPurchaseAmount = _.sumBy(totalPurchaseYear, 'amount')
    let totalSaleAmount = _.sumBy(totalSaleYear, 'amount')
    let total = totalPurchaseAmount - totalSaleAmount
    return total
  }
  getPorcentagem(totalSaldo: number, yearSaldo: number) {
    let totalPorcentagem = (yearSaldo * 100) / totalSaldo
    return Math.abs(totalPorcentagem).toFixed(2)
  }
}

module.exports = Reports
