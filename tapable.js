import {
  SyncHook,
  SyncBailHook,
  SyncWaterfallHook,
  SyncLoopHook,
  AsyncParallelHook,
  AsyncParallelBailHook,
  AsyncSeriesHook,
  AsyncSeriesBailHook,
  AsyncSeriesWaterfallHook,
} from "tapable";
class List {
    getRoutes() {

    }
    routesList() {

    }
}
class Car {
  constructor() {
    this.hooks = {
      accelerate: new SyncHook(["newSpeed"]),
      brake: new SyncHook(),
      calculateRoutes: new AsyncParallelHook([
        "source",
        "target",
        "routesList",
      ]),
    };
  }
  setSpeed(newSpeed) {
    // following call returns undefined even when you returned values
    // 触发事件
    this.hooks.accelerate.call(newSpeed);
  }

  useNavigationSystemPromise(source, target) {
    const routesList = new List();
    console.log("calculateRoutes")
    return this.hooks.calculateRoutes
      .promise(source, target, routesList)
      .then((res) => {
        // res is undefined for AsyncParallelHook
        return routesList.getRoutes();
      });
  }

  useNavigationSystemAsync(source, target, callback) {
    const routesList = new List();
    this.hooks.calculateRoutes.callAsync(source, target, routesList, (err) => {
      if (err) return callback(err);
      callback(null, routesList.getRoutes());
    });
  }
}
const myCar = new Car();

// Use the tap method to add a consument
// 注册事件
myCar.hooks.accelerate.tap("WarningLampPlugin", (speed) => {
    console.log('accelerate', speed)
});
myCar.hooks.calculateRoutes.tapPromise('test promise', (source, target) => {
    return new Promise((reslove, rejected) => {
        setTimeout(() => {
            console.log('test promise', source, target)
        })
    })
})
myCar.hooks.calculateRoutes.tapPromise('test promise', (source, target) => {
    return new Promise((reslove, rejected) => {
        setTimeout(() => {
            console.log('test promise222', source, target)
        })
    })
})
// 触发事件
myCar.setSpeed(10)
myCar.useNavigationSystemPromise([1, 2, 3], 'test')
