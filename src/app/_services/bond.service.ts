import { Injectable } from '@angular/core';

@Injectable()
export class BondService {
  private coupon_amount: number;

  constructor(
    private face_value: number,
    private period_num: number,
    private interest_rate: number,
    private periodicity: number,
    coupon_rate: number
  ) {
    this.coupon_amount = (this.face_value * (coupon_rate / 100)) / this.periodicity;

    // for testing - print values: 
    console.log("coupon rate: " + this.coupon_amount);
    console.log("interest rate: " + this.interest_rate);
    console.log("periodicity" + this.periodicity);
  }

  // getters
  public getFaceValuePV(): number {
    return this.lumpSum(
      this.face_value,
      this.period_num * this.periodicity,
      this.interest_rate / (this.periodicity * 100)
    );
  }
  public getCouponPV(): number {
    return this.annuity(
      this.coupon_amount,
      this.period_num * this.periodicity,
      this.interest_rate / (this.periodicity * 100)
    );
  }
  public getBondPV(): number {
    return this.getFaceValuePV() + this.getCouponPV();
  }

  // pv of coupon payments
  public annuity(amount: number, t: number, r: number) {
    let presentValue = 0;

    // summation
    for (let i = 1; i <= t; i++) {
      presentValue += this.lumpSum(amount, i, r);
    }

    return presentValue;
  }

  // pv of given single amount
  public lumpSum(amount: number, t: number, r: number) {
    return amount / Math.pow(1 + r, t);
  }

  // generate the ammortization table:
  public genAmmTable(): number[][] {
    let ammArr:any = [];

    // fill first row of table:
    let beginning_balance = this.getBondPV();
    let int_exp = (this.interest_rate / 100.0) * beginning_balance / this.periodicity;
    let net = int_exp - this.coupon_amount;
    let ending_balance = beginning_balance + net;
    ammArr.push([
      beginning_balance, 
      int_exp,
      this.coupon_amount,
      net,
      ending_balance
    ]);

    // iterate and fill rest of the array:
    for(let i = 1; i < (this.period_num * this.periodicity); i++) {
      // calculate values: 
      beginning_balance = ammArr[i-1][4];
      int_exp = (this.interest_rate / 100.0) * beginning_balance / this.periodicity;
      net = int_exp - this.coupon_amount;
      ending_balance = beginning_balance + net;

      // add to array:
      ammArr.push([
        beginning_balance, 
        int_exp,
        this.coupon_amount,
        net,
        ending_balance
      ]);

    }

    return ammArr;
  }

  public relativeToMarket(): String {
    let epsilon = 0.001; // epsilon for double comparison
    // calculate difference
    let diff = this.face_value - this.getBondPV();
    let absDiff = Math.abs(diff);

    // premium: pv < fv
    if (diff < 0 && absDiff > epsilon) {
      return 'premium';
      // discount: pv > fv
    } else if (diff > 0 && absDiff > epsilon) {
      return 'discount';
      // par: pv < fv
    } else {
      return 'par';
    }
  }
}
