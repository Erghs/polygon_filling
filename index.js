var canvas = document.getElementById('graph');
var btn = document.getElementById('btn');
var btn1 = document.getElementById('btn1');
var btn2= document.getElementById('btn2')
var ctx = canvas.getContext('2d');
 
var Point = function(x, y) {
	this.x = x;
	this.y = y;
}
 
function setPixel (x,y) { // имитация установки пикселя
	ctx.fillRect(x, y, 1, 1);
}
 
function drawBack(){ //отрисовка фона
	var color = ['white', 'yellow'];
	var w = canvas.width/20;
	var h = canvas.height/20;
 
	var t = 0;
	for(var i = 0; i < canvas.width; i+=w){
		for(var j = 0; j < canvas.height; j+=h){
			ctx.fillStyle = color[t];
			ctx.fillRect(i, j, w, h);
			t = (t + 1)%2;
		}
		t = (t + 1)%2;
	}
}
drawBack();
 
function drawPolygon()
{
	var p = [];
	if(arguments.length > 1){
		for(var i = 0; i < arguments.length/2; i++)
			p.push(new Point(arguments[2*i], arguments[2*i+1]));
	} else p = arguments[0];
	RemoveOdd(p);
 
	var n = p.length;
	for(var i = 0; i < n-1; i++)
		line(p[i].x, p[i].y, p[i+1].x, p[i+1].y);
	line(p[n-1].x, p[n-1].y, p[0].x, p[0].y);
}
 
// функция построчной заливки
function fillPolygon(){
 
	var p = []; // массив с вершинами
	if(arguments.length > 1){
		for(var i = 0; i < arguments.length/2; i++)
			p.push(new Point(arguments[2*i], arguments[2*i+1]));
	} else p = arguments[0];
	RemoveOdd(p);
 
	var Ymin = findMinY(p); // верхняя точка многоугольника
	var Ymax = findMaxY(p); // нижняя точка многоугольника
	var n = p.length; // количество вершин
 
	var Xs = [];
 
	// сканируем каждую строчку 
	for(var y = Ymin; y < Ymax; y++){
		// ищем вершины в строке
		for(var i = 0; i < n; i++){
 
			if(y == p[i].y){ // нашли вершину в текущей строке
				var i1 = (n+i-1)%n; // индекс предыдущей вернины от найденной
				var i2 = (i+1)%n;   // индекс следующей вершины от найденной
 
				if(p[i].y != p[i2].y){ // две вершины не образуют горизонтальное ребро
					if( p[i].y <  p[i2].y){ // текущая вершина находится выше следующей
						//добавляем в массив ребро для отрисовки
						Xs.push({
							P: p[i], // вершина ребра
							P2: p[i2], // вершина ребра
							x: p[i].x, // текущая координата по x для ребра
							k: (p[i2].x - p[i].x)/(p[i2].y - p[i].y), // коэффициент угла наклона
						});
						Xs.sort(sortf); // соритруем все ребра по текущему x слева на право
					}else{ // текущая вершина находится ниже следующей
						for(var j in Xs){ // ищем ребро и удаляем его
							if(Xs[j].P == p[i2] && Xs[j].P2 == p[i]){
								Xs.splice(j, 1);
								break;
							}
						}
					}
				}
				//тоже самое для предыдущей вершины
				if(p[i].y != p[i1].y){
					if( p[i].y <  p[i1].y){
						Xs.push({
							P: p[i],
							P2: p[i1],
							x: p[i].x,
							k: (p[i1].x - p[i].x)/(p[i1].y - p[i].y),
						});
						Xs.sort(sortf);
					}else{
						for(var j in Xs){
							if(Xs[j].P == p[i1] && Xs[j].P2 == p[i]){
								Xs.splice(j, 1);
								break;
							}
						}
					}
				}
 
			}
 
		}
		// закрашиваем строки между последовательными парами ребер
		for(var i = 1; i < Xs.length/2+1; i++){
			var i1 = 2*i-2;
			var i2 = 2*i-1;
 
			line(Math.ceil(Xs[i1].x), y, Math.floor(Xs[i2].x), y);
			// обновляем текущий x для всех ребер
			Xs[i1].x += Xs[i1].k;
			Xs[i2].x += Xs[i2].k;
		}
 
	}
 
 
}
 
function sortf(a, b){
	if(a.P == b.P){
		if(a.k < b.k) return -1;
	}
 
	if(a.x < b.x) return -1;
	return 1;
}
 
function findMinY(p){
	var Y = p[0].y;
	for(i in p)
		Y = Math.min(Y, p[i].y);
	return Y;
}
 
function findMaxY(p){
	var Y = p[0].y;
	for(i in p)
		Y = Math.max(Y, p[i].y);
	return Y;
}
 
function RemoveOdd(polygon)
{//удаление лишних вершин
	for(var i = 0; i < polygon.length; i++)
		while(polygon.length > 2 && Square(polygon[i%polygon.length], polygon[(1+i)%polygon.length], polygon[(2+i)%polygon.length]) == 0)  polygon.splice((1+i)%polygon.length, 1);
}
 
function Square(A, B, C) {
	return 1/2 * Math.abs((A.x * B.y + B.x * C.y + C.x * A.y) - (A.y * B.x + B.y * C.x + C.y * A.x));
}
 
function line (x1, y1, x2, y2)
{//рисование линии по алгоритму Брезенхема
 
	var dx, dy, d, d1, d2, x, y, stp;
 
	dx = x2 - x1;
	dy = y2 - y1;
	if ( (Math.abs(dx) > Math.abs(dy) && x2 < x1) ||
	 (Math.abs(dx) <= Math.abs(dy) && y2 < y1)){
		x = x1;
		x1 = x2;
		x2 = x;
		y = y1;
		y1 = y2;
		y2 = y;
	}
	dx = x2 - x1;
	dy = y2 - y1;
	stp = 1;
	setPixel(x1, y1);
	if (Math.abs(dx) > Math.abs(dy)){
		if (dy < 0){
		  stp = -1;
		  dy = -dy;
		}
		d = (dy * 2) - dx;
		d1 = dy * 2;
		d2 = (dy - dx) * 2;
		y = y1;
		for(x = x1 + 1; x <= x2; x++){
		  if (d > 0){
			y = y + stp;
			d = d + d2;
		  }else d = d + d1;
		  setPixel(x, y);
		}
	} else{
		if (dx < 0){
		  stp = -1;
		  dx = -dx;
		}
		d = (dx * 2) - dy;
		d1 = dx * 2;
		d2 = (dx - dy) * 2;
		x = x1;
		for(y = y1 + 1; y <= y2; y++){
		  if (d > 0){
			x = x + stp;
			d = d + d2;
		  }else d=d+d1;
		  setPixel(x, y);
		}
	}
}   
 
var pol = [];
 
canvas.addEventListener("mousedown", function (e)
{
 
	if(e.which == 1){
		drawBack();
		ctx.fillStyle = 'black';
		var x = e.offsetX;
		var y = e.offsetY;
		pol.push(new Point(x,y));
		drawPolygon(pol);
	}else if(e.which == 2){
		ctx.fillStyle = 'red';
		fillPolygon(pol);
		ctx.fillStyle = 'black';
		drawPolygon(pol);
		pol = [];
	}
});
btn.addEventListener("click", function(e){
    ctx.fill()
	ctx.fillStyle = 'red';
		fillPolygon(pol);
		ctx.fillStyle = 'black';
		drawPolygon(pol);
		pol = [];
        
})
btn2.addEventListener("click", function(e){
    console.log("ff")
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBack();
})

btn1.addEventListener("click", function(e){
	drawBack();
	ctx.fillStyle = 'black';
    pol = [];
    const vertices = 10;
    const _points = generateRandomConvexPolygon(vertices);
    const points = _points.map(p => new Point(p.x * 300, p.y * 300));
    ctx.moveTo(points[0].x, points[0].y);
  
    for(let i = 1; i < vertices ; ++i)
    {
      let x = points[i].x;
      let y = points[i].y;
      pol.push(new Point(x,y))
    }
    drawPolygon(pol)
})



//рандомный многоугольник
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}


function generateRandomNumbersArray(len) {
  const result = new Array(len);
  for (let i = 0; i < len; ++i) {
    result[i] = Math.random();
  }
  return result;
}

function generateRandomConvexPolygon(vertexNumber) {
  const xPool = generateRandomNumbersArray(vertexNumber);
  const yPool = generateRandomNumbersArray(vertexNumber);

//   debugger;
  xPool.sort();
  yPool.sort();

  const minX = xPool[0];
  const maxX = xPool[xPool.length - 1];
  const minY = yPool[0];
  const maxY = yPool[yPool.length - 1];

  const xVec = []
  const yVec = [];

  let lastTop = minX;
  let lastBot = minX;

  xPool.forEach(x => {
    if (Math.random() >= 0.5) {
      xVec.push(x - lastTop);
      lastTop = x;
    } else {
      xVec.push(lastBot - x);
      lastBot = x;
    }
  });

  xVec.push(maxX - lastTop);
  xVec.push(lastBot - maxX);

  let lastLeft = minY;
  let lastRight = minY;

  yPool.forEach(y => {
    if (Math.random() >= 0.5) {
      yVec.push(y - lastLeft);
      lastLeft = y;
    } else {
      yVec.push(lastRight - y);
      lastRight = y;
    }
  });

  yVec.push(maxY - lastLeft);
  yVec.push(lastRight - maxY);

  shuffle(yVec);
  
  vectors = [];
  for (let i = 0; i < vertexNumber; ++i) {
    vectors.push(new Point(xVec[i], yVec[i]));
  }
  
  vectors.sort((v1, v2) => {
    if (Math.atan2(v1.y, v1.x) > Math.atan2(v2.y, v2.x)) {
      return 1;
    } else {
      return -1;
    }
  });
  
  let x = 0, y = 0;
  let minPolygonX = 0;
  let minPolygonY = 0;
  let points = [];
  
  for (let i = 0; i < vertexNumber; ++i) {
    points.push(new Point(x, y));
    x += vectors[i].x;
    y += vectors[i].y;
    
    minPolygonX = Math.min(minPolygonX, x);
    minPolygonY = Math.min(minPolygonY, y);
  }
  
          // Move the polygon to the original min and max coordinates
  let xShift = minX - minPolygonX;
  let yShift = minY - minPolygonY;

  for (let i = 0; i < vertexNumber; i++) {
    const p = points[i];
    points[i] = new Point(p.x + xShift, p.y + yShift);
  }
  
  return points;
}
function draw() {
    const vertices = 10;
    const _points = generateRandomConvexPolygon(vertices);
    
    //apply scale
    const points = _points.map(p => new Point(p.x * 300, p.y * 300));
  
  
  
    ctx.fillStyle = '#f00';
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
  
    for(let i = 1; i < vertices ; ++i)
    {
      let x = points[i].x;
      let y = points[i].y;
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }
