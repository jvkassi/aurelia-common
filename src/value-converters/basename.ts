
export class BaseNameValueConverter {

  toView(path: string, fullpath: string) {

    // show fullpath or not
    fullpath = typeof fullpath === 'undefined' ? undefined : fullpath;

    if (path === undefined || !path) {
      return path;
    }
    return fullpath ? path : path.split(/[\\/]/).pop();
  }

}
