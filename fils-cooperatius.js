function make_thread_system() {
    var threads = [];
    var halt = null;

    function shift() {
        var nt = threads.shift()
        nt()
    }

    return {
        spawn: function(thunk) {
            var c = current_continuation()
            if (c instanceof Continuation) {
                threads.push(c)
            } else {
                thunk()
            }
        },
        quit: function() {
            if (threads.length > 0) {
                shift()
            } else {
                halt()
            }
        },
        relinquish: function() {
            var c = new Continuation()
            if (c instanceof Continuation) {
                threads.push(c)
                shift()
            }
        },
        start_threads: function() {
            var c = current_continuation()
            if (c instanceof Continuation) {
                halt = c
                shift()
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
