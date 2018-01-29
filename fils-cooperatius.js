function make_thread_system() {
    var spawned = 0;
    var threads = [];
    var halt = null;

    function make_thread(c, name) {
        return { cont: c, name: name }
    }

    function push(c, name) {
        threads.push(make_thread(c, name))
        print(threads.map(t => t.name))
    }

    function shift() {
        var nt = threads.shift()
        print('Shift: ' + nt.name)
        nt.cont(2)
    }

    return {
        spawn: function(thunk, name) {
            var c = current_continuation()
            if (c instanceof Continuation) {
                push(c, name)
                print('spawn push')
                spawned++;
            } else {
                print('spawn thunk')
                thunk()
            }
        },
        quit: function(name) {
            // "== 2" en la imp de scheme
            if (threads.length > 0) {
                print('quit: remaining threads')
                shift()
            } else {
                print('quit: halt')
                halt()
            }
        },
        relinquish: function(name) {
            //Por alguna razón, los threads a, b, c que se guardan al principio, no se recuperan al hacer shift(). Se queda en el thread "name: c".
            print('relinquish from: ' + name)
            print('tlen: ' + threads.length)
            var c = new Continuation()
            if (c instanceof Continuation) {
                print('relinquish push')
                push(c, name)
                var nt = threads.shift()
                print('Shift: ' + nt.name)
                nt.cont()
            }
        },
        start_threads: function() {
            print('start')
            var c = current_continuation()
            if (c instanceof Continuation) {
                halt = c
                print('start call')
                //halt = c tendria que estar aquí. Para inicializar halt con la continuación de star_threads y que al hacer halt() entre al else
                shift()
            } else {
                print('finish')
            }
        }
    }
}

function current_continuation() {
    return new Continuation();
}

function make_thread_thunk(name, thread_system) {
    function loop() {
        for (let i = 0; i < 5; i++) {
            print('in thread', name, '; i =', i);
            thread_system.relinquish(name);
        }
        thread_system.quit();
    };
    return loop;
}
var thread_sys = make_thread_system();
thread_sys.spawn(make_thread_thunk('a', thread_sys), 'a');
thread_sys.spawn(make_thread_thunk('b', thread_sys), 'b');
thread_sys.spawn(make_thread_thunk('c', thread_sys), 'c');
thread_sys.start_threads();