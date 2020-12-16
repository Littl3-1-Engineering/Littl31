var s1 = Snap('#b1'),
    s2 = Snap('#b2'),
    // s4 = Snap('#b4'),
    s5 = Snap('#b5'),
    s6 = Snap('#b6'),
    s7 = Snap('#b7'),
    s8 = Snap('#b8'),
    s9 = Snap('#b9'),
    s3 = Snap('#b3'),
    c = 200/2,
    clr = 'orange';

function r(circumference) {
  return circumference/(2*Math.PI);
}
function s(circumference, count, w, spaceAfter) {
  w ? w = w : w = 5;
  var res = [w, (circumference/count)-w];
  spaceAfter ? res = [(circumference/count)-w, w] : res = res;
  return res;
}
function rot(w) {
  return ['r-'+(w*2/3),c,c]
}

// C I
//======================================
  var c11 = s1.circle(c,c,r(300)).attr({
    fill: 'transparent',
    stroke: clr,
    strokeWidth: 2,
  });
  var c12 = s1.circle(c,c,r(300)).attr({
    fill: 'transparent',
    stroke: clr,
    strokeWidth: 6,
    strokeDasharray: s(300,4,5),
    transform: ['r-'+5*(2/3),c,c]
  });

  c12.node.onclick=function() {
    c12.attr({
      r: r(300),
      strokeDasharray: s(300,4,5),
      transform: ['r-'+5*(2/3),c,c]
    })
    Snap.animate(300,360,function(v){
      var vc = v-300;
      c12.attr({
        r: r(v),
        strokeDasharray: s(v,4,5),
        transform: ['r'+((vc*1.5)-(5*(2/3))),c,c]
      })
    }, 800, timingFunc2, function() {
      c12.animate({
        transform: ['r'+(180-(5*(2/3))),c,c]
      }, 800, mina.bounce, function(){
        Snap.animate(360,300,function(v){
          c12.attr({
            r: r(v),
            strokeDasharray: s(v,4,5)
          })
        }, 800, timingFunc2)
      })
    });
  }
  
// C II
//======================================
  var c21 = s2.circle(c,c,r(300)).attr({
    fill: 'transparent',
    stroke: clr,
    strokeWidth: 2,
  });
  var c22 = s2.circle(c,c,r(280)).attr({
    fill: 'transparent',
    stroke: clr,
    strokeWidth: 6,
    strokeDasharray: String((280/4)),
  });
  var c23 = s2.circle(c,c,r(340)).attr({
    fill: 'none',
    stroke: clr,
    strokeWidth: 0,
    strokeDasharray: String((340/4)),
    transform: ['r90',c,c]
  });

  c22.node.onclick = function(){
    c22.attr({
      r: r(280),
      strokeDasharray: String((280/4)),
      transform: ['r-0',c,c]
    });
    Snap.animate(280, 250, function(v){
      c22.attr({
        r: r(v),
        strokeDasharray: String((v/4)),
        transform: ['r-'+(Math.abs(v-280)*3),c,c]
      });
      c23.attr({
        strokeWidth: (Math.abs(v-280)*0.2),
        transform: ['r'+(Math.abs(v-280)*3*2),c,c]
      })
    }, 800, timingFunc2, function() {
      Snap.animate(250,280,function(v){
        c22.attr({
          r: r(v),
          strokeDasharray: String((v/4)),
        });
        c23.attr({
          strokeWidth: (Math.abs(v-280)*0.2),
          transform: ['r'+(Math.abs(v-280)*6*2),c,c]
        });
      }, 800, timingFunc2);
      Snap.animate(90, 180, function(v){
        c22.attr({
          transform: ['r-'+v,c,c]
        });
      }, 800, timingFunc2);
    })
  }
  
// C III
//======================================
  function repeat(arr, count) {
    var res = [];
    for (var i = 0; i<count; i++) {
      res = res.concat(arr);
    };
    return res;
  }
  var c31 = s3.circle(c,c,r(300)).attr({
    fill: 'transparent',
    stroke: clr,
    strokeWidth: 2,
    strokeDasharray: [String((300/3)), String((300*(2/3)))]
  });
  var c32 = s3.circle(c,c,r(220)).attr({
    fill: 'transparent',
    stroke: clr,
    strokeWidth: 2,
    strokeDasharray: [String((220/3)), String((220*(2/3)))]
  });
  var c34 = s3.circle(c,c,r(160)).attr({
    fill: 'transparent',
    stroke: clr,
    strokeWidth: 2,
    strokeDasharray: [(160/3), (160/6)],
    // strokeOpacity: .5,
    transform: ['r'+0,c,c]
  });
  var c35 = s3.circle(c,c,r(40)).attr({
    fill: 'transparent',
    stroke: clr,
    strokeWidth: 2,
    // strokeOpacity: .5,
  });
  var c36 = s3.circle(c,c,r(300)).attr({
    fill: 'transparent',
    stroke: clr,
    strokeWidth: 2,
    strokeDasharray: [String((300/3)), String((300*(2/3)))],
    transform: ['r'+180,c,c]
  });
  var c37 = s3.circle(c,c,r(220)).attr({
    fill: 'transparent',
    stroke: clr,
    strokeWidth: 2,
    strokeDasharray: [String((220/3)), String((220*(2/3)))],
    transform: ['r'+180,c,c]
  });
  var c38 = s3.circle(c,c,r(260)).attr({
    fill: 'transparent',
    stroke: clr,
    strokeWidth: 14,
    strokeDasharray: repeat([String(260/180), String(260/60)], 15).concat(String(260/180)).concat(String(240)),
    transform: ['r'+180,c,c]
  });
  var c33 = s3.circle(c,c,r(260)).attr({
    fill: 'transparent',
    stroke: clr,
    strokeWidth: 14,
    strokeDasharray: repeat([String(260/180), String(260/60)], 15).concat(String(260/180)).concat(String(240))
  });
  c33.node.onclick = function(){
    Snap.animate(0, 100, function(v) {
      var c3g = s3.group(c31, c32, c33, c36, c37, c38);
      c31.attr({
        r: r(300+v),
        strokeDasharray: [String(((300+v)/3)), String(((300+v)*(2/3)))]
      });
      c33.attr({
        r: r(260+(v/2)),
        strokeWidth: 14+(v/6),
        strokeDasharray: repeat([String((260+v)/180), String((260+v)/(60+(v/(100/15))))], 15).concat(String((260+v)/180)).concat(String(240))
      });
      c36.attr({
        r: r(300+v),
        strokeDasharray: [String(((300+v)/3)), String(((300+v)*(2/3)))]
      });
      c38.attr({
        r: r(260+(v/2)),
        strokeWidth: 14+(v/6),
        strokeDasharray: repeat([String((260+v)/180), String((260+v)/(60+(v/(100/15))))], 15).concat(String((260+v)/180)).concat(String(240))
      });
      c34.attr({
        transform: ['r-'+(v*3.6),c,c]
      });
      c35.attr({
        r: r(40+v)
      });
      c3g.attr({
        transform: ['r'+v*3.6,c,c]
      });
    }, 800, timingFunc2, function(){
      Snap.animate(100, 0, function(v) {
        var c3g = s3.group(c31, c32, c33);
        c31.attr({
          r: r(300+v),
          strokeDasharray: [String(((300+v)/3)), String(((300+v)*(2/3)))]
        });
        c33.attr({
          r: r(260+(v/2)),
          strokeWidth: 14+(v/6),
          strokeDasharray: repeat([String((260+v)/180), String((260+v)/(60+(v/(100/15))))], 15).concat(String((260+v)/180)).concat(String(240))
        });
        c36.attr({
          r: r(300+v),
          strokeDasharray: [String(((300+v)/3)), String(((300+v)*(2/3)))]
        });
        c38.attr({
          r: r(260+(v/2)),
          strokeWidth: 14+(v/6),
          strokeDasharray: repeat([String((260+v)/180), String((260+v)/(60+(v/(100/15))))], 15).concat(String((260+v)/180)).concat(String(240))
        });
        c35.attr({
          r: r(40+v)
        });
        c34.attr({
          transform: ['r-'+(v*1.8),c,c]
        });
      }, 800, timingFunc2)
    })
  }

// C IV
//======================================
//   var c41 = s4.circle(c,c,r(300)).attr({
//     fill: 'transparent',
//     stroke: clr,
//     strokeWidth: 2,
//   });
//   var c42 = s4.circle(c,c,r(200)).attr({
//     fill: 'transparent',
//     stroke: clr,
//     strokeWidth: 50,
//     strokeOpacity: 1,
//     strokeDasharray: 1 + ' ' + String((200/2.7)),
//   });

//   function stripeCirc(circ, count, half) {
//     var a, c, s = '';
//     half ? c = 2 : c = 1;
//     count%2===0 ? a = 1 : a = 0; // fix spacing issue
//     var repeat = (circ/4)/(circ/2/count/c)+a;
//     for (var i=0;i<repeat;i++) {
//       s+=' ';
//       s+=String((circ/2)/count);
//     }
//     return s
//   }
//   var c43 = s4.circle(c,c,r(300)).attr({
//     fill: 'transparent',
//     stroke: clr,
//     strokeWidth: 20,
//     strokeOpacity: .3,
//     strokeDasharray: (String(300/2)-10) + ' ' + (String(300/2)+10),
//     transform: 'r115,100,100'
//   });
//   var c44 = s4.circle(c,c,r(300)).attr({
//     fill: 'transparent',
//     stroke: clr,
//     strokeWidth: 15,
//     strokeOpacity: .3,
//     strokeDasharray: stripeCirc(300, 33, !!1) + ' ' + (String(300/2)-1),
//     transform: 'r290,100,100'
//   });

// C V
//======================================
  var c51 = s5.circle(c,c,r(300)).attr({
    fill: 'transparent',
    stroke: clr,
    strokeWidth: 2,
    strokeOpacity: 1,
    strokeDasharray: String((300/5)-4) + ' 4'
  });
  var c52 = s5.circle(c,c,r(280)).attr({
    fill: 'transparent',
    stroke: clr,
    strokeWidth: 2,
  });
  var c53 = s5.circle(c,c,r(80)).attr({
    fill: 'transparent',
    stroke: clr,
    strokeWidth: 2,
    strokeDasharray: String((80/5)-4) + ' 4'
  });
  var c53 = s5.circle(c,c,r(2)).attr({
    fill: 'transparent',
    stroke: clr,
    strokeWidth: 2
  });

// C VI
//======================================
  var c61 = s6.circle(c,c,r(300)).attr({
    fill: 'transparent',
    stroke: clr,
    strokeWidth: 10,
    strokeOpacity: .25,
    strokeDasharray: String((300/4)),
    transform: 'r45, 100, 100'
  });
  var c62 = s6.circle(c,c,r(300)).attr({
    fill: 'transparent',
    stroke: clr,
    strokeWidth: 2,
    strokeOpacity: .5,
    strokeDasharray: String((300/4))
  });
  var c63 = s6.circle(c,c,r(200)).attr({
    fill: 'transparent',
    stroke: clr,
    strokeWidth: 2,
    strokeOpacity: .25,
    transform: 'r45, 100, 100'
  });
  var c64 = s6.circle(c,c,r(5)).attr({
    fill: 'transparent',
    stroke: clr,
    strokeWidth: 2
  });
  var c65 = s6.circle(c,c,r(200)).attr({
    fill: 'transparent',
    stroke: clr,
    strokeWidth: 8,
    strokeLinecap: 'round',
    strokeDasharray: '1 '+String((200/2)-1),
    transform: 'r-.5, 100, 100'
  });
  var c66 = s6.circle(c,c,r(250)).attr({
    fill: 'transparent',
    stroke: clr,
    strokeWidth: 4,
    strokeLinecap: 'round',
    strokeDasharray: '1 '+String((250/2)-1),
    transform: 'r-.5, 100, 100'
  });

// C VII
//======================================
  var c71 = s7.circle(c,c,r(300)).attr({
    fill: 'transparent',
    stroke: clr,
    strokeWidth: 16,
    strokeOpacity: 1,
    strokeDasharray: [8, ((300/4)-8)],
    transform: 'r, 100, 100'
  });
  var c72 = s7.circle(c,c,r(300)).attr({
    fill: 'transparent',
    stroke: clr,
    strokeWidth: 2,
  });
  var c73 = s7.circle(c,c,r(260)).attr({
    fill: 'transparent',
    stroke: clr,
    strokeWidth: 1,
  });
  var c74 = s7.circle(c,c,r(320)).attr({
    fill: 'transparent',
    stroke: clr,
    strokeWidth: 10,
    strokeOpacity: 0.65,
    strokeDasharray: (320/100)
  });
  var c75 = s7.circle(c,c,r(20)).attr({
    fill: 'transparent',
    stroke: clr,
    strokeWidth: 1,
  });
  c74.node.onclick = function(){
    c71.attr({transform: ['r0',c,c]});
    c74.attr({transform: ['r0',c,c]});
    Snap.animate(0,100,function(v){
      c74.attr({
        r: r(320-v),
        strokeDasharray: ((320-v)/100)
      })
      c71.attr({
        r: r(300+(v)),
        strokeDasharray: [8, (((300+(v))/4)-8)],
      })
    }, 800, timingFunc2);
    c74.animate({
      transform: ['r-'+(360),c,c]
    }, 3500, timingFunc3);
    c71.animate({
      transform: ['r'+(135),c,c]
    }, 1200, timingFunc, function(){
      c71.animate({
        transform: ['r'+(225),c,c]
      }, 500, timingFunc2, function(){
        c71.animate({
          transform: ['r'+(90),c,c]
        }, 1000, timingFunc);
      });
      Snap.animate(0,100,function(v){
        c74.attr({
          r: r(220+(v)),
          strokeDasharray: ((220+(v))/100),
        })
        c71.attr({
          r: r(400-(v)),
          strokeDasharray: [8, (((400-(v))/4)-8)],
        })
      }, 1500, timingFunc);
    });
  }

// C VIII
//======================================
  var c81 = s8.circle(c,c,r(280)).attr({
    fill: clr,
    fillOpacity: .2,
    stroke: 'none',
    strokeWidth: 10,
    strokeOpacity: 1,
    transform: 'r7.5, 100, 100'
  });
  var c82 = s8.circle(c,c,r(300)).attr({
    fill: 'transparent',
    stroke: clr,
    strokeWidth: 10,
    strokeOpacity: 1,
    strokeDasharray: String((300/4)-(300/20)) + ' ' + String((300/20)),
    transform: 'r7.5, 100, 100'
  });
  var c83 = s8.circle(c,c,r(60)).attr({
    fill: 'transparent',
    stroke: clr,
    strokeWidth: 10,
    strokeOpacity: 1,
    strokeDasharray: String((60/40)) + ' ' + String((60/4)-(60/40)),
    transform: 'r-5, 100, 100'
  });
  var c84 = s8.circle(c,c,r(30)).attr({
    fill: clr
  });
  var c84 = s8.circle(c,c,r(200)).attr({
    fill: 'transparent',
    stroke: clr,
    strokeWidth: 2,
    strokeOpacity: .1
  });

// C IX
//======================================
  var c91 = s9.circle(c,c,r(300)).attr({
    fill: 'transparent',
    stroke: clr,
    strokeWidth: 2,
    strokeDasharray: String((300/6)),
    transform: ['r-60',c,c]
  });
  var c92 = s9.circle(c,c,r(300)).attr({
    fill: 'transparent',
    stroke: clr,
    strokeWidth: 15,
    strokeDasharray: String((300/6)),
    //transform: 'r-5,100,100'
  });
  var c93 = s9.circle(c,c,r(330)).attr({
    fill: 'transparent',
    stroke: clr,
    strokeWidth: 2,
    strokeDasharray: String((330/6)),
    transform: ['r-60',c,c]
  });
  var c93 = s9.circle(c,c,r(270)).attr({
    fill: 'transparent',
    stroke: clr,
    strokeWidth: 10,
    strokeDasharray: [String(270/40), String((270/3)-(270/40))],
    transform: ['r27',c,c]
  });
  var c93 = s9.circle(c,c,r(250)).attr({
    fill: 'transparent',
    stroke: clr,
    strokeWidth: 15,
    strokeDasharray: [String(250/60), String((250/6)-(250/30)), String(250/60), String((250/6))],
  });
  var c93 = s9.circle(c,c,r(210)).attr({
    fill: 'transparent',
    stroke: clr,
    strokeWidth: 2,
    strokeDasharray: String(210/6),
  });



//======================================
// ANIMATIONS
//======================================
var bezier = function(x1, y1, x2, y2, epsilon){
	var curveX = function(t){
		var v = 1 - t;
		return 3 * v * v * t * x1 + 3 * v * t * t * x2 + t * t * t;
	};
	var curveY = function(t){
		var v = 1 - t;
		return 3 * v * v * t * y1 + 3 * v * t * t * y2 + t * t * t;
	};
	var derivativeCurveX = function(t){
		var v = 1 - t;
		return 3 * (2 * (t - 1) * t + v * v) * x1 + 3 * (- t * t * t + 2 * v * t) * x2;
	};
	return function(t){

		var x = t, t0, t1, t2, x2, d2, i;

		// First try a few iterations of Newton's method -- normally very fast.
		for (t2 = x, i = 0; i < 8; i++){
			x2 = curveX(t2) - x;
			if (Math.abs(x2) < epsilon) return curveY(t2);
			d2 = derivativeCurveX(t2);
			if (Math.abs(d2) < 1e-6) break;
			t2 = t2 - x2 / d2;
		}

		t0 = 0, t1 = 1, t2 = x;

		if (t2 < t0) return curveY(t0);
		if (t2 > t1) return curveY(t1);

		// Fallback to the bisection method for reliability.
		while (t0 < t1){
			x2 = curveX(t2);
			if (Math.abs(x2 - x) < epsilon) return curveY(t2);
			if (x > x2) t0 = t2;
			else t1 = t2;
			t2 = (t1 - t0) * .5 + t0;
		}

		// Failure
		return curveY(t2);

	};
};

var duration = 200; var epsilon = (1000 / 60 / duration) / 4;

var timingFunction = bezier(0.08, 1.05, 0.95, 0.12, epsilon);
var timingFunction2 = bezier(0.5, 0.5, 0.5, 0.5, epsilon );
var timingFunc = bezier(.75, 0, 0.15, 1, epsilon );
var timingFunc2 = bezier(.5, 0, 0, 1, epsilon );
var timingFunc3 = bezier(0, 0, 0.25, 1, epsilon );


var collapsed = false;
$('a').click(function(){
  if (collapsed) {
    $('div').css({
      'position':'relative',
      'display':'inline-block',
      'top':'0',
      'left':'0',
      'transform':'none'
    });
    $('#b2').parent().show();
    $('#b4').parent().show();
    $('#b9').parent().show();
    $('#b8').parent().show();
    collapsed = false;
  } else {
    $('div').css({
      'position':'absolute',
      'top':'50%',
      'left':'50%',
      'transform':'translate(-50%,-50%)'
    });
    $('#b2').parent().hide();
    $('#b4').parent().hide();
    $('#b9').parent().hide();
    $('#b8').parent().hide();
    collapsed=true;
  }
})