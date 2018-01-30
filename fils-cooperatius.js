load("continuation.js");

function make_thread_system() {
    var threads = [];
    var halt;

    function shift() {
        var nt = threads.shift();
        nt();
    }

    return {
        spawn: function(thunk) {
            var c = current_continuation();
            if (c instanceof Continuation) {
                threads.push(c);
            } else {
                thunk();
            }
        },
        quit: function() {
            if (threads.length > 0) {
                shift();
            } else {
                halt();
            }
        },
        relinquish: function() {
            var c = new Continuation();
            threads.push(c);
            shift();
        },
        start_threads: function() {
            halt = new Continuation();
            shift();
        }
    }
}

print('Test make_thread_thunk (global counter)');

(function test1() {
    var counter = 10;
    function make_thread_thunk(name, thread_system) {
        function loop() {
            if (counter < 0) {
                thread_system.quit();
            }
            print('in thread', name, '; counter =', counter);
            counter--;
            thread_system.relinquish();
            loop();
        };
        return loop;
    }

    var thread_sys = make_thread_system();
    thread_sys.spawn(make_thread_thunk('a', thread_sys));
    thread_sys.spawn(make_thread_thunk('b', thread_sys));
    thread_sys.spawn(make_thread_thunk('c', thread_sys));
    thread_sys.start_threads();
})();

print('Test make_thread_thunk_2 (per-thread counter)');

(function test2() {
    function make_thread_thunk_2(name, thread_system) {
        function loop() {
            for (let i = 0; i < 5; i++) {
                print('in thread', name, '; i =', i);
                thread_system.relinquish();
            }
            thread_system.quit();
        };
        return loop;
    }

    thread_sys = make_thread_system();
    thread_sys.spawn(make_thread_thunk_2('a', thread_sys));
    thread_sys.spawn(make_thread_thunk_2('b', thread_sys));
    thread_sys.spawn(make_thread_thunk_2('c', thread_sys));
    thread_sys.start_threads();
})();

print('Test make_thread_thunk_3 (maximum of a list)');

(function test3() {
    var list = [1, 3, 2, 6, 9, 3, 0]; // not empty
    print('list', list);

    var i = 0;
    var max = list[i];

    function make_thread_thunk_3(name, thread_system) {
        function list_max() {
            var count = 0;
            while (i < list.length) {
                print('in thread', name, '; list[', i, '] = ', list[i]);
                if (list[i] > max) {
                    print('update max = ', list[i]);
                    max = list[i];
                }
                i++;
                thread_system.relinquish();
            }
            thread_system.quit();
        };
        return list_max;
    }

    thread_sys = make_thread_system();
    thread_sys.spawn(make_thread_thunk_3('a', thread_sys));
    thread_sys.spawn(make_thread_thunk_3('b', thread_sys));
    thread_sys.spawn(make_thread_thunk_3('c', thread_sys));
    thread_sys.start_threads();
    print('max = ', max);
})();

print('Test make_thread_thunk_4 (maximum of a list defining thread granularity)');

(function test4() {
    var list = [1, 3, 2, 6, 9, 3, 0]; // not empty
    var n_threads = 3;
    var thread_count = parseInt(list.length / n_threads);

    print('list', list);
    print('n_threads', n_threads);
    print('thread count', thread_count);

    var i = 0;
    var max = list[i];

    function make_thread_thunk_4(name, thread_system) {
      function list_max() {
        var count = 0;
        while (i < list.length) {
          print('in thread', name, '; list[', i, '] = ', list[i]);
          if (list[i] > max) {
            print('update max = ', list[i]);
            max = list[i];
          }
          i++;
          count++;
          if (count === thread_count) {
            count = 0;
            thread_system.relinquish();
          }
        }
        thread_system.quit();
      };
      return list_max;
    }

    thread_sys = make_thread_system();

    for (let t = 1; t <= n_threads; t++) {
      thread_sys.spawn(make_thread_thunk_4(String.fromCharCode(96 + t), thread_sys));
    }

    thread_sys.start_threads();
    print('max = ', max);
})();