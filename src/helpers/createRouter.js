//@flow

function getMatch(url: string, pattern: string) {
  //Patern : /products/:id
  //url : /products/123
  let patternSplit = pattern.split('/');
  let urlSplit = url.split('/');
  if (patternSplit.length !== urlSplit.length) {
    return null;
  }
  let arrayPattern = [];
  let count = 0;
  for (let eachPattern of patternSplit) {
    if (eachPattern.includes(':')) {
      arrayPattern.push(urlSplit[count]);
    } else {
      if (eachPattern !== urlSplit[count]) {
        return null;
      }
    }
    count += 1;
  }
  return arrayPattern;
}

type Route = {
  pattern: string;
  handler: Function;
};
type RouteList = Array<Route>;

export default function createRouter() {
  let routeList: RouteList = [];
  let notFoundHandler: ?Function;
  return {
    addRoute: (pattern: string, handler: Function) => {
      routeList.push({pattern, handler});
    },
    onNotFound: (handler: Function) => {
      notFoundHandler = handler;
    },
    route: (url: string) => {
      for (let {pattern, handler} of routeList) {
        let matchList = getMatch(url, pattern);
        if (matchList != null) {
          handler(...matchList);
          return;
        }
      }
      if (notFoundHandler != null) {
        notFoundHandler();
      }
    },
  };
}

// export default function createRouter() {
//   let state = {};
//   let checkNotFound: ?Function;
//
//   return {
//     addRoute: (pattern: string, callback: Function) => {
//       state[pattern] = callback;
//     },
//     onNotFound: (callback: () => {}) => {
//       checkNotFound = callback;
//     },
//     route: (url: string) => {
//       for (let eachState of Object.keys(state)) {
//         let matchList = getMatch(url, eachState);
//         if (matchList !== null) {
//           let fn = state[eachState];
//           console.log(fn);
//           fn(...matchList);
//           return;
//         }
//       }
//       if (checkNotFound) {
//         checkNotFound();
//       }
//     },
//   };
// }
