export const addCommas = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const copyText = async (num) => {
    try {
      await navigator.clipboard.writeText(num);
    } catch (err) {}
};

export const formatAddress = (address) => {
    let text;
    if (address) {
      let firstHalf = address.slice(0, 5);
      let secondHalf = address.slice(-5);
      text = firstHalf + '...' + secondHalf;
      return text;
    }
    text = 'Address unavailable';
    return text;
  };

export const formatTimestampMs = (timestamp) => {
  let timestampString = new Date(timestamp).toLocaleString(undefined, {day:"numeric", month: "short", year:"numeric", hour: 'numeric', minute: 'numeric', hour12: true});
  return timestampString;
}

export const formatTimestampSecs = (timestamp) => {
  let timestampString = new Date(timestamp*1000).toLocaleString(undefined, {day:"numeric", month: "short", year:"numeric", hour: 'numeric', minute: 'numeric', hour12: true});
  return timestampString;
}

export const shortenBytes = (n) => {
  const k = n > 0 ? Math.floor(Math.log10(n) / 3) : 0;
  const rank = (k > 0 ? 'KMGT'[k - 1] : '') + 'B';
  const rank_clean = rank === 'B' ? 'Bytes' : rank;
  const count = Math.floor(n / Math.pow(1000, k));
  const decimal = n / Math.pow(1000, k) - count;
  const countString = decimal !== 0 ? (n / Math.pow(1000, k)).toFixed(2) : count.toString();
  return countString + ' ' + rank_clean;
};

export const formatSats = (sats) => {
  let btc = sats / Math.pow(10, 8);
  let string = btc.toFixed(btc % 1 !== 0 ? 2 : 0) + " BTC";
  return string;
};