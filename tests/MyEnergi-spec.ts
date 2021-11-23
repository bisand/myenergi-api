import { MyEnergi } from '../src/MyEnergi'
import { expect } from 'chai'

describe("MyEnergi Tests", () => {
  it("should be able to test", () => {
    expect(true).to.be.true;
  });
  it("should be able to create instance", () => {
    const myenergi = new MyEnergi('test', 'pwd');
    expect(myenergi).to.be.instanceOf(MyEnergi);
  });
});
