export class OrderByValueConverter {
  // to View
  toView(array, propertyName, asc, type = "string") {
    // console.log(array.length)
    return (
      array
        //   .slice(0) // dont know
        .sort((a, b) => {
          if (type == "string") {
            //   console.log(type)
            // compare object from propertyName name
            //   const dst =
            return asc
              ? this.fetchFromObject(a, propertyName).localeCompare(
                  this.fetchFromObject(b, propertyName)
                )
              : this.fetchFromObject(b, propertyName).localeCompare(
                  this.fetchFromObject(a, propertyName)
                );

          } else {
            return asc // compare object from propertyName name
              ? this.fetchFromObject(a, propertyName) -
                  this.fetchFromObject(b, propertyName)
              : this.fetchFromObject(b, propertyName) -
                  this.fetchFromObject(a, propertyName);
          }
        })
    );
  }

  fetchFromObject(obj, prop) {
    if (typeof obj === "undefined" || typeof prop === "undefined") {
      return false;
    }

    let _index = prop.indexOf(".");

    return obj[prop];
  }
}
