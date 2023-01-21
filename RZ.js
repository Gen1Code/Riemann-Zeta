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
var T = BigNumber.ZERO;
var q, s_r, s_i;
var Z;
var ZChange = true;


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
        q.bought = (_) => ZChange = true;
    }


    //s_r
    {
        let getDesc = (level) => "\\sigma =" + getS(level).toString(0);
        let getInfo = (level) => "\\sigma =" + getS(level).toString(0);
        s_r = theory.createUpgrade(1, currency, new FreeCost());
        s_r.getDescription = (amount) => Utils.getMath(getDesc(s_r.level));
        s_r.getInfo = (amount) => Utils.getMathTo(getInfo(s_r.level), getInfo(s_r.level + amount));
        s_r.bought = (_) => ZChange = true;
    }

    // s_i
    {
        let getDesc = (level) => "t=" + getS(level).toString(0);
        let getInfo = (level) => "t=" + getS(level).toString(0);
        s_i = theory.createUpgrade(2, currency, new FreeCost());
        s_i.getDescription = (amount) => Utils.getMath(getDesc(s_i.level));
        s_i.getInfo = (amount) => Utils.getMathTo(getInfo(s_i.level), getInfo(s_i.level + amount));
        s_i.bought = (_) => ZChange = true;
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

    if(ZChange){
        Z = getZ(getS(s_r.level),getS(s_i.level));
        ZChange = false;
    }
    
    T += dt;

    rho_dot = Z == BigNumber.ONE ? BigNumber.ZERO : BigNumber.ONE/(Z - BigNumber.ONE).abs();
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

    let result = "\\dot{\\rho}= \\left | \\frac{1}{\\left| \\zeta(s) \\right| -1}\\right|";
    result += "\\\\"
    result += "\\zeta (s) = \\sum_{n=1}^{q}\\frac{1}{n^s}"
    
    return result;
}

var getSecondaryEquation = () => {
    theory.secondaryEquationHeight = 50;

    let result = "s = \\sigma + it";    

    return result

}

var getTertiaryEquation = () => {
    let result = "\\dot{\\rho} = "+rho_dot;
    result += "&, \\qquad \\zeta (s) = "+Z;
    result += "&,\\qquad T="+T;

    return result
}

var power1 = (a,b,c) =>{
    let arg = c*a.log();
    return a.pow(b)*arg.cos();
}
var power2 = (a,b,c) =>{
    let arg = c*a.log();
    return a.pow(b)*arg.sin();
}


var getPublicationMultiplier = (tau) => tau.pow(2.203)/200;
var getPublicationMultiplierFormula = (symbol) => "\\frac{\\tau^{2.203}}{200}";
var getTau = () => currency.value.pow(0.1);
var getCurrencyFromTau = (tau) => [tau.max(BigNumber.ONE).pow(10), currency.symbol];
var get2DGraphValue = () => currency.value.sign * (BigNumber.ONE + currency.value.abs()).log10().toNumber();

var getQ = (level) => BigNumber.from(level);
var getS = (level) => BigNumber.from(level);
var getZ = (s_r,s_i) => {
    let sum_r = BigNumber.ZERO;
    let sum_i = BigNumber.ZERO;

    for(var i = BigNumber.ONE; i<=q.level; i += BigNumber.ONE){
        tmp_r = power1(i,-s_r,-s_i);
        tmp_i = power2(i,-s_r,-s_i);
        sum_r += tmp_r;
        sum_i += tmp_i;
    }
    return (sum_r*sum_r+sum_i*sum_i).sqrt();
}

init();