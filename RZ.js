import { ExponentialCost, FreeCost } from "../api/Costs";
import { Localization } from "../api/Localization";
import { parseBigNumber, BigNumber } from "../api/BigNumber";
import { theory } from "../api/Theory";
import { Utils } from "../api/Utils";

var id = "riemann_zeta"
var name = "Riemann Zeta";
var description = "not null";
var authors = "";
var version = 1;
var releaseOrder = "6";
var rho_dot = BigNumber.ZERO;
var t = BigNumber.ZERO;
var q, s;

var init = () => {
    currency = theory.createCurrency();

    ///////////////////
    // Regular Upgrades

    // q
    {
        let getDesc = (level) => "q=" + getQ(level).toString(0);
        let getInfo = (level) => "q=" + getQ(level).toString(0);
        q = theory.createUpgrade(0, currency, new FreeCost());
        q.getDescription = (amount) => Utils.getMath(getDesc(q.level));
        q.getInfo = (amount) => Utils.getMathTo(getInfo(q.level), getInfo(q.level + amount));
    }


    // s
    {
        let getDesc = (level) => "s=" + getS(level).toString(0);
        let getInfo = (level) => "s=" + getS(level).toString(0);
        s = theory.createUpgrade(1, currency, new FreeCost());
        s.getDescription = (amount) => Utils.getMath(getDesc(s.level));
        s.getInfo = (amount) => Utils.getMathTo(getInfo(s.level), getInfo(s.level + amount));
    }


    /////////////////////
    // Permanent Upgrades
    theory.createPublicationUpgrade(0, currency, 1e10);
    theory.createBuyAllUpgrade(1, currency, 1e15);
    theory.createAutoBuyerUpgrade(2, currency, 1e35);

    /////////////////////
    // Checkpoint Upgrades
    theory.setMilestoneCost(new CustomCost(lvl => BigNumber.from(lvl < 4 ? 1 + 3.5*lvl : lvl<5 ? 22 : 50)));


    updateAvailability();
}

var updateAvailability = () => {
   
}

var tick = (elapsedTime, multiplier) => {

    let dt = BigNumber.from(elapsedTime * multiplier);
    let bonus = theory.publicationMultiplier;

    let vz = getZ(getS(s.level));
    t += dt;

    rho_dot = vz == BigNumber.ONE ? BigNumber.ZERO : BigNumber.ONE/(vz.abs() - BigNumber.ONE);
    currency.value += bonus * dt * rho_dot;

    theory.invalidateTertiaryEquation();
}

var getInternalState = () => ``

var setInternalState = (state) => {
    let values = state.split(" ");
}

var postPublish = () => {

}

var getPrimaryEquation = () => {
    theory.primaryEquationHeight = 120;

    let result = "\\dot{\\rho}=\\frac{1}{|\\zeta(s)|-1}";
    result += "\\\\"
    result += "\\zeta (s) = \\sum_{n=1}^{q}\\frac{1}{n^s}"
    
    return result;
}

var getSecondaryEquation = () => {
    theory.secondaryEquationHeight = 50;

    let result = "";    

    return result

}

var getTertiaryEquation = () => {
    let result = "\\dot{\\rho} = "+rho_dot;
    result += "&, \\qquad \\zeta (s) = "+getZ(getS(s.level));
    result += "&,\\qquad t="+t;

    return result
}

var getPublicationMultiplier = (tau) => tau.pow(2.203)/200;
var getPublicationMultiplierFormula = (symbol) => "\\frac{\\tau^{2.203}}{200}";
var getTau = () => BigNumber.ONE;
var getCurrencyFromTau = (tau) => [tau.max(BigNumber.ONE).pow(10), currency.symbol];
var get2DGraphValue = () => currency.value.sign * (BigNumber.ONE + currency.value.abs()).log10().toNumber();

var getQ = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
var getS = (level) => BigNumber.from(level);
var getZ = (s) => {
    sum = BigNumber.ZERO;
    for(var i = BigNumber.ONE; i<=q.level; i += BigNumber.ONE){
        sum += BigNumber.ONE/i.pow(s);
    }
    return sum;
}

init();