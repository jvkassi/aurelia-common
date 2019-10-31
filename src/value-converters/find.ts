export class findValueConverter {

  // to View
  toView(coll, id, name) {

    if (!coll) return coll;

    let a = coll.filter(x => x.id == id)
    if (a.length > 0) {
      let name = a[0].name
        // console.log(name)
      return name
    } else {

      return ''
    }

  }

}
