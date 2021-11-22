import { MyEnergi } from '../src/MyEnergi'
import { equal } from "assert";
import { expect } from 'chai'

describe("MyEnergi Tests", () => {
  it("should be able to test", () => {
    equal(true, true);
  });
  it("should be able to create instance", () => {
    const myenergi = new MyEnergi('test', 'pwd');
    expect(myenergi).to.be.instanceOf(MyEnergi);
  });
  it("should get status data", async () => {
    const myenergi = new MyEnergi('test', 'pwd');
    const status = await myenergi.getStatus();
    expect(myenergi).to.be.instanceOf(MyEnergi);
  });
});
