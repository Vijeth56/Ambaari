export const toINR = (number: any) => {
  try {
    var x = number;
    x = x.toString();
    var afterPoint = "";
    if (x.indexOf(".") > 0) afterPoint = x.substring(x.indexOf("."), x.length);
    x = Math.floor(x);
    x = x.toString();
    var lastThree = x.substring(x.length - 3);
    var otherNumbers = x.substring(0, x.length - 3);
    if (otherNumbers != "") lastThree = "," + lastThree;
    return (
      "\u20B9" +
      " " +
      otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") +
      lastThree +
      afterPoint
    );
  } catch (error) {
    return 0;
  }
};
