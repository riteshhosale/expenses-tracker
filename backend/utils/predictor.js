// Simple predictor using monthly totals and linear regression-like trend.
export const predictExpense = (expenses) => {
if(!expenses || expenses.length === 0) return 0;
// Group by YYYY-MM
const months = {};
expenses.forEach(e=>{
const d = new Date(e.date);
const key = `${d.getFullYear()}-${('0'+(d.getMonth()+1)).slice(-2)}`;
months[key] = (months[key] || 0) + Number(e.amount);
});
const sorted = Object.keys(months).sort();
const vals = sorted.map(k=>months[k]);
// If fewer than 3 months use average
if(vals.length < 3){
const avg = vals.reduce((a,b)=>a+b,0)/vals.length;
return avg * 1.05; // +5% cushion
}
// simple linear trend: slope between first and last
const first = vals[0];
const last = vals[vals.length-1];
const slope = (last - first) / (vals.length - 1);
const predicted = last + slope; // next month
return Math.max(predicted, 0);
}