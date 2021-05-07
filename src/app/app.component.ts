import { Component, VERSION } from '@angular/core';
import { BondService } from './_services/bond.service';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  // record form inputs:
  form: any = {
    face_value: null,
    period_num: null,
    interest_rate: null,
    coupon_rate: null,
    period_frac: null
  };
  // store bond details to display:
  bond: any = {
    pv_faceValue: null,
    pv_coupons: null,
    pv_bondTotal: null,
    relativeText: null,
    ammTable: null
  };
  submitted: boolean = false;
  distCount: number = 0;
  yearCount: number = 1;

  constructor() {}

  updateTable(): void {
    if (this.submitted) {
      this.calculate();
    }
    // only re-calculate once form has been submitted
  }

  // reset values before recalculating
  reset(): void {
    this.distCount = 0;
    this.yearCount = 1;
  }

  // update year count, track and return current dist in table:
  increment(): number {
    this.distCount++;
    if (this.distCount > this.form.period_frac) {
      // new year / period - set back to 1
      this.distCount = 1;
    }
    this.yearCount += Math.trunc(this.distCount / this.form.period_frac);
    return this.distCount;
  }

  // round number to 2 decimal places:
  formatNum(num: number) {
    return num.toFixed(2);
  }

  // handle double comparison (TODO: refactor this)
  isGreater(num1: number, num2: number): boolean {
    let epsilon = 0.001; // epsilon for double comparison
    // calculate difference
    let diff = num1 - num2;
    let absDiff = Math.abs(diff);
    if (diff > 0 && absDiff > epsilon) {
      return true;
    } else {
      return false;
    }
  }
  isLess(num1: number, num2: number): boolean {
    let epsilon = 0.001; // epsilon for double comparison
    // calculate difference
    let diff = num1 - num2;
    let absDiff = Math.abs(diff);
    if (diff < 0 && absDiff > epsilon) {
      return true;
    } else {
      return false;
    }
  }

  calculate(): void {
    this.submitted = true;

    this.reset();

    // get form inputs:
    const {
      face_value,
      period_num,
      interest_rate,
      coupon_rate,
      period_frac
    } = this.form;

    // instantiate bond class:
    let curBond: BondService = new BondService(
      face_value,
      period_num,
      interest_rate,
      period_frac,
      coupon_rate
    );

    // set bond details:
    this.bond.pv_faceValue = curBond.getFaceValuePV();
    this.bond.pv_bondTotal = curBond.getBondPV();
    this.bond.pv_coupons = curBond.getCouponPV();
    this.bond.ammTable = curBond.genAmmTable();

    // TODO: refactor this
    this.bond.relativeText = () => {
      let relative = curBond.relativeToMarket();
      if (relative === 'premium') {
        return 'This bond is at a premium to market value.';
      } else if (relative === 'discount') {
        return 'This bond is at a discount to market value.';
      } else {
        return 'This bond is on par with market value.';
      }
    };
  }
}
