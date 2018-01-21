
function make_thread_system() {
    var threads = []
    var halt
    return {
        spawn: (thunk) => {
            var c = current_continuation()
            if (c instanceof Continuation) {
                threads.push(c)
            } else {
                thunk()
            }
        },
        quit: () => {
            // "== 2" en la imp de scheme
            if (threads.length > 0) {
                var nt = threads.shift()
                nt()
            } else {
                halt()
            }
        },
        relinquish: () => {
            //Por alguna razón, los threads a, b, c que se guardan al principio, no se recuperan al hacer shift(). Se queda en el thread "name: c".
            print('tlen: ' + threads.length)
            var c = current_continuation()
            if (c instanceof Continuation){
                threads.push(c)
                var nt = threads.shift()
                nt()
            }
        },
        start_threads: () => {
            var c = current_continuation()
            halt = c
            if (c instanceof Continuation) {
                //halt = c tendria que estar aquí. Para inicializar halt con la continuación de star_threads y que al hacer halt() entre al else
                var nt = threads.shift()
                nt()
            }
            else {
                print('finish')
            }
        }
    }
}

function current_continuation() {
    return new Continuation();
}

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