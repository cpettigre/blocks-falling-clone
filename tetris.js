CANVAS_WIDTH = 250;
CANVAS_HEIGHT = 500;
X_CELLS = 10;
Y_CELLS = 20;
CELL_WIDTH = CANVAS_WIDTH / X_CELLS;
CELL_HEIGHT = CANVAS_HEIGHT / Y_CELLS;

SCORE_LOC_Y = 30;
LEVEL_LOC_Y = 50;

D_GREY = "#474a4f";
GREY = "#d3d3d3";
L_GREY = "#f1f1f1";
YELLOW = "#f9f95e";
L_BLUE = "#7fb0ff";
GREEN = "#97fc7e";
RED = "#ff746b";
LAVENDER = "#c37aff";
PINK = "#ffa3d5";
ORANGE = "#ff995e";

POSSIBLE_SHAPES = ["square", "l_squiggle", "r_squiggle", "tee", "ell_r", "ell_l", "line"];

var game = {
	canvas : document.createElement("canvas"),
	
	start : function()
	{
		this.canvas.width = CANVAS_WIDTH;
		this.canvas.height = CANVAS_HEIGHT;
		this.context = this.canvas.getContext("2d");
		document.body.insertBefore(this.canvas, document.body.childNodes[0]);
		this.score = 0;
		this.level = 1
		this.initialiseBoards();
		this.playerLoc = new CentreBlock(POSSIBLE_SHAPES[Math.floor(Math.random() * POSSIBLE_SHAPES.length)]);
		this.currentSpeed = 900;
		this.faster = false;
		this.runInterval();
	},
	
	getTextPos : function(text)
	{
		var charArray = text == "score" ? this.score.toString().split("") : this.level.toString().split("");
		var numOfDigits = charArray.length;
		return CANVAS_WIDTH - (12 * numOfDigits);
	},

	increaseScore: function(points)
	{
		this.score += points;
	},

	increaseLevel : function()
	{
		this.level += 1;
		this.currentSpeed -= 99;
		clearInterval(this.interval);
		this.interval = setInterval(newInterval, this.currentSpeed);
	},

	checkForLevelUp: function()
	{
		var threshold;

		switch(this.level)
		{
		  case 1:
			threshold = 1000;
			break;

		  case 2:
			threshold = 4000;
			break;

		  case 3:
			threshold = 9000;
			break;

		  case 4:
			threshold = 16000;
			break;

		  case 5:
			threshold = 25000;
			break;

		  case 6:
			threshold = 36000;
			break;

		  case 7:
			threshold = 42000;
			break;

		  case 8:
			threshold = 64000;
			break;

		  case 9:
			threshold = 81000;
			break;

		  case 10:
			return;
		}

		if (this.score > threshold)
		{
		  this.increaseLevel();
		}
	},

	runInterval : function()
	{
		this.interval = setInterval(newInterval, this.currentSpeed);
	},
	
	initialiseBoards : function()
	{
		this.cellBoard = new Board("cellBoard");
		this.testBoard = new Board("testBoard");
	},

	deployBlock : function(action)
	{
		var i;
		for (i=0; i<this.playerLoc.fullArray.length; i++)
		{
			var nextMoveSpace = this.playerLoc.fullArray[i];
			this.testBoard.outerArray[nextMoveSpace.xCoord][nextMoveSpace.yCoord].updateBlock(action, this.playerLoc.colour);
		}

		if (action != "settle")
		{
			for (i=0; i<this.playerLoc.fullArray.length; i++)
			{
				this.playerLoc.willSettle = this.testBoard.checkForSettle(this.playerLoc.fullArray[i]);
				if (this.playerLoc.willSettle === true)
				{
					break;
				}
			}
		}
	},

	updateCanvas : function()
	{
		var x;
		var y;
		for (x=0; x<X_CELLS; x++)
		{
			for (y=0; y<Y_CELLS; y++)
			{
				if (this.testBoard.outerArray[x][y].state.occupied === false && this.testBoard.outerArray[x][y].state.settled === false)
				{
					this.cellBoard.outerArray[x][y].updateCell("clear", GREY);
				}

				else
				{
					var blockColor = this.testBoard.outerArray[x][y].colour;
					this.cellBoard.outerArray[x][y].updateCell("paint", blockColor);
				}
			}
		}

		ctx.strokeStyle = D_GREY;
		ctx.font = "20px Arial";
		ctx.strokeText(game.score, game.getTextPos("score"), SCORE_LOC_Y);
		ctx.strokeText(game.level, game.getTextPos("level"), LEVEL_LOC_Y);
	},

	initiateMove : function(direction)
	{
		this.playerLoc.getMove(direction); //getting co-ordinates plus checks to make sure move is on the board and doesn't collide
	},

	processKeyDown : function(data)
	{
		if (data.key == "ArrowLeft")
		{
			this.initiateMove("left");
			game.deployBlock("occupy");
			game.testBoard.updateVacatingBlock();
			game.updateCanvas();
		}

		if (data.key == "ArrowRight")
		{
			this.initiateMove("right");
			game.deployBlock("occupy");
			game.testBoard.updateVacatingBlock();
			game.updateCanvas();
		}

		if (data.key == "ArrowUp")
		{
			this.initiateMove("rotate");
			game.deployBlock("occupy");
			game.testBoard.updateVacatingBlock();
			game.updateCanvas();
		}

		if (data.key == "ArrowDown" && this.faster == false)
		{
			var intervalSpeed = 100;
			clearInterval(this.interval);
			this.interval = setInterval(newInterval, intervalSpeed);
			this.faster = true;
			newInterval();
		}

	},

	processKeyUp : function(data)
	{
		if (data.key == "ArrowDown" && this.faster == true)
		{
			clearInterval(this.interval);
			this.interval = setInterval(newInterval, this.currentSpeed);
			this.faster = false;
		}
	}
}

function newInterval()
{
	if (game.playerLoc.willSettle == true) 	
	{
		game.increaseScore(14);
		game.deployBlock("settle");
		game.testBoard.checkRowFull();
		game.updateCanvas();
		game.playerLoc.makeSettle();
		game.initiateMove("newBlock");
	}

	else
	{
		game.initiateMove("down");
	}

	game.checkForLevelUp();
	game.deployBlock("occupy");
	game.testBoard.updateVacatingBlock();
	game.updateCanvas();
	game.playerLoc.newBlock = false;
}

function CentreBlock(shape)
{
	this.getMove = function(direction)
	{
		this.willSettle = false;
		
		switch (direction)
		{
		  case "down":
			this.coords.yCoord += 1;
			break;
		  case "left":
			this.coords.xCoord -= 1;
			break;
		  case "right":
			this.coords.xCoord += 1;
			break;
		  case "rotate":
			if (this.rotationIndex<this.deployAlgorithm.length-1)
			{
				this.rotationIndex += 1;
			}
			else
			{
				this.rotationIndex = 0;
			}
				
		}
		
		var movePossible = this.getFullArray();
		if (movePossible === false)
		{
			switch (direction)
			{
			  case "down":
				this.coords.yCoord -= 1;
				break;
			  case "left":
				this.coords.xCoord += 1;
				break;
			  case "right":
				this.coords.xCoord -= 1;
				break;
			  case "rotate":
				if (this.rotationIndex -1 < 0)
				{
					this.rotationIndex = this.deployAlgorithm.length - 1;
				}
				else
				{
					this.rotationIndex -= 1;
				}		
			}
			this.getFullArray();
		}
	};

	this.getFullArray = function()
	{
		this.fullArray = [];
		var lastPointStored = this.coords;
		var firstPoint = true;

		var i;
		for (i=-1; i<this.deployAlgorithm[this.rotationIndex].length; i++)
		{
			var nextPoint;

			//Get next point
			if (firstPoint == true)
			{
				nextPoint = this.coords;	
			}

			else
			{
				var firstLetter = this.deployAlgorithm[this.rotationIndex][i][0];
				//Check for capital letter, indicating where to take the next direction from
				var departurePoint = firstLetter.toUpperCase() == firstLetter ? this.coords : lastPointStored;
				var direction = this.deployAlgorithm[this.rotationIndex][i].toLowerCase();

				switch (direction)
				{
				  case "up":
					nextPoint = new Coord(departurePoint.xCoord, departurePoint.yCoord - 1);
					lastPointStored = nextPoint;
					break;
				  case "down":
					nextPoint = new Coord(departurePoint.xCoord, departurePoint.yCoord + 1);
					lastPointStored = nextPoint;
					break;
				  case "left":
					nextPoint = new Coord(departurePoint.xCoord - 1, departurePoint.yCoord);
					lastPointStored = nextPoint;
					break;
				  case "right":
					nextPoint = new Coord(departurePoint.xCoord + 1, departurePoint.yCoord);
					lastPointStored = nextPoint;
				}
			}

			// ONE : Check if the co.ordinate is within the board
			if (nextPoint.xCoord == X_CELLS || nextPoint.xCoord < 0 || nextPoint.yCoord == Y_CELLS)
			{
				this.fullArray = [];
				console.log("out of bounds");
				return false;
			}

			// TWO : Check if the co-ordinate collides with a settled block

			var moveOk = game.testBoard.checkForCollision(nextPoint);
			switch (moveOk)
			{
			  case "settledBlocks":
				this.fullArray = [];
				return false;
			  case "reachedTop":
				endGame();
			}

			// If tests passed allow the block to space to occupied
			this.fullArray.push(nextPoint);

			firstPoint = false;
		
		}
		return true;
	}

	this.makeSettle = function()
	{
		if (this.willSettle == true)
		{
			newCentreBlock = new CentreBlock(POSSIBLE_SHAPES[Math.floor(Math.random() * POSSIBLE_SHAPES.length)]);
			game.playerLoc = newCentreBlock;
		}
	}

	switch (shape)
	{
	  case "square":
		this.deployAlgorithm = [["Up", "right", "down"]];
		this.colour = YELLOW;
		break;

	  case "l_squiggle":
		this.deployAlgorithm = [["Right", "up", "Down"], ["Down", "right", "Left"]];
		this.colour = L_BLUE;
		break;

	  case "r_squiggle":
		this.deployAlgorithm = [["Up", "Right", "down"], ["Right", "Down", "left"]];
		this.colour = GREEN; 
		break;

	  case "tee":
		this.deployAlgorithm = [["Left", "Right", "Down"], ["Up", "Left", "Down"], ["Left","Up","Right"], ["Up", "Right", "Down"]];
		this.colour = RED;
		break;

	  case "ell_r":
		this.deployAlgorithm = [["Up", "Down", "right"],["Right","Left","down"],["Down","Up","left"],["Left", "Right", "up"]];
		this.colour = PINK;
		break;

	  case "ell_l":
		this.deployAlgorithm = [["Up", "Down", "left"],["Left", "up", "Right"],["Up", "right", "Down"],["Right", "down", "Left"]];
		this.colour = LAVENDER;
		break;

	  case "line":
		this.deployAlgorithm = [["Up","Down","down"],["Right","Left","left"],["Down","Up","up"],["Left","Right","right"]]; 
		this.colour = ORANGE;
		
	}

	this.coords = new Coord(4, 1);
	this.rotationIndex = 0;
	this.shape = shape;
	this.getFullArray();

	this.willSettle = false;
	this.newBlock = true;
}


function Board(boardType)
{
	this.makeNewColumn = function(i)
	{
		var j;
		var innerArray = [];
		for (j=0; j<Y_CELLS; j++)
		{
			if (boardType == "cellBoard")
			{
				newCell = new Cell(i, j);
				innerArray.push(newCell);
			}
			
			else if (boardType == "testBoard")
			{
				newBlock = new Block();
				innerArray.push(newBlock);
			}
			
			else
			{
				console.log("board type not recognised:" + this);
			}
		}
		
		this.outerArray.push(innerArray);
	}
	
	this.outerArray = [];
	this.boardType = boardType;

	var i;
	for (i=0; i<X_CELLS; i++)
	{
		this.makeNewColumn(i);
	}

	if (this.boardType == "testBoard")
	{
		this.checkForCollision = function(moveCoord)
		{
			if (this.outerArray[moveCoord.xCoord][moveCoord.yCoord].state.settled == true)
			{
				if (game.playerLoc.coords.yCoord <= 1)
				{
					console.log("reachedTop");
					return "reachedTop";
				}

				else
				{
					return "settledBlocks";
				}
			}

			else
			{
				return "ok";
			}
		}

		this.checkForSettle = function(moveCoord)
		{
			if (moveCoord.yCoord+1 == Y_CELLS || this.outerArray[moveCoord.xCoord][moveCoord.yCoord+1].state.settled == true)
			{
				console.log("will settle");
				return true;
			}

			else
			{
				return false;
			}
		}

		this.checkRowFull = function()
		{
			console.log("check row full");
			completeRowArray = [];

			var y;
			for (y=0; y<Y_CELLS; y++)
			{
				var rowSettled = true;

				var x;
				for (x=0; x<X_CELLS; x++)
				{
					if (this.outerArray[x][y].state.settled != true)
					{
						rowSettled = false;
						break;
					}
				}

				if (rowSettled == true)
				{
					console.log("Row settled");
					completeRowArray.push(y);
				}
			}

			var points;
			switch(completeRowArray.length)
			{
			  case 1:
				points = 101;
				break;
			  case 2:
				points = 202;
				break;
			  case 3:
				points = 404;
				break;
			  case 4:
				points = 808;
				break;
			  default:
				points = 0;
			}
			
			game.increaseScore(points);

			var i;
			for (i=0; i<completeRowArray.length; i++)
			{
				this.deleteRow(completeRowArray[i]);
			}
		}

		this.deleteRow = function(rowIndex)
		{
			var x;
			for (x=0; x<X_CELLS; x++)
			{
				this.outerArray[x].splice(rowIndex, 1);
				this.outerArray[x].unshift(new Block());
			}
		}

		this.updateVacatingBlock = function()
		{
			for (x=0; x<X_CELLS; x++)
			{
				for (y=0; y<Y_CELLS; y++)
				{
					if (this.outerArray[x][y].state.vacating == true)
					{
						this.outerArray[x][y].state.vacating = false;
						this.outerArray[x][y].state.occupied = false;
					}
						
					if (this.outerArray[x][y].state.occupied == true)
					{
						this.outerArray[x][y].state.vacating = true;
					}
				}
			}
		}
	}
}

function Block()
{
	this.colour = GREY;
	this.state = {
		occupied : false,
		vacating : false,
		settled : false,
	}

	this.updateBlock = function(action, colour)
	{
		switch (action)
		{
		  case "clear":
			this.state.occupied = false;
			this.colour = colour;
			this.state.vacating = false;
			this.state.settled = false;
			break;

		  case "occupy":
			this.state.occupied = true;
			this.state.vacating = false;
			this.state.settled = false;
			this.colour = colour;
			break;

		  case "settle":
			this.state.settled = true;
			this.state.occupied = false;
			this.state.vacating = false;
			this.colour = colour;
		}
	}
}

function Cell(x, y)
{
	this.width = CELL_WIDTH;
	this.height = CELL_HEIGHT;
	this.x_pixel = x * CELL_WIDTH;
	this.y_pixel = y * CELL_HEIGHT;
	ctx = game.context;
	ctx.font = "30px Arial";
	ctx.strokeText(game.score , game.getTextPos("score"), SCORE_LOC_Y);
	this.updateCell = function(action, color)
	{
		switch (action)
		{
		  case "clear":
			ctx.clearRect(this.x_pixel, this.y_pixel, this.width, this.height);
			ctx.strokeStyle = color;
			ctx.strokeRect(this.x_pixel, this.y_pixel, this.width, this.height);
			break;

		  case "paint":
			ctx.fillStyle = color;
			ctx.fillRect(this.x_pixel, this.y_pixel, this.width, this.height);
		}
	}
}

function Coord(x, y)
{
	this.xCoord = x;
	this.yCoord = y;
}


function init()
{
	game.start();
	document.onkeydown = function(data)
	{
		game.processKeyDown(data);
		
	}
	document.onkeyup = function(data)
	{
		game.processKeyUp(data);
	}
}

function endGame()
{
	clearInterval(game.interval);
	alert("Game Over!");
	location.reload();
}
