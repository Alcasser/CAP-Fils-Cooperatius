function current_continuation() {
    return new Continuation();
}

function callcc(f) {
    return f(new Continuation());
}

// TESTS

function assertEquals(expected, actual) {
  if (expected !== actual) {
    throw new Error('assertEquals failed: expected "' + expected + '" but found "' + actual + '"');
  }
}

function test(f) {
  f();
  print('Test ' + f.name + ' success');
}

// current_continuation
function testContinuation() {
  var cc = current_continuation();
  if (cc instanceof Continuation) {
    cc(2);
  } else {
    assertEquals(2, cc);
  }
}

// callcc
function testCallcc() {
  var kont;
  var i = callcc((cc) => {
    kont = cc;
    return 1;
  });

  if (i === 1) {
    kont(2);
  } else {
    assertEquals(2, i);
  }
}

test(testContinuation);
test(testCallcc);