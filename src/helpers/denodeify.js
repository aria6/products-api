//@flow
type Callback<T> = (error: ?Error, data: T) => void;

type NodeStyleFunction<P, T> = (param: P, Callback: Callback<T>) => void;
type PromiseStyleFunction<P, T> = (param: P) => Promise<T>;

function denodeify<P, T>(nodeStyleFn: NodeStyleFunction<P, T>): PromiseStyleFunction<P, T> {
  return (param: P) => {
    let promise = new Promise((resolve, reject) => {
      nodeStyleFn(param, (error, data) => {
        if (error) {
          reject(error);
        }
        if (data) {
          resolve(data);
        }
      });
    });
    return promise;
  };
}

export default denodeify;
