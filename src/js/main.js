const liftDataStore = {
    floors: 0,
    lifts: 0,
  };
  
  let lifts = [];
  let liftRequestQueue = [];
  
  const simulateBtn = document.querySelector(".input-btn");
  const simulationContainer = document.getElementById("simulation-container");
  
  function initializeSimulation(numberOfFloors, numberOfLifts) {
    simulationContainer.innerHTML = "";
    lifts = [];
    liftRequestQueue = [];
    simulationContainer.style.width=`${270+60*numberOfLifts+2*numberOfLifts}px`
    for (let i = numberOfFloors; i > 0; i--) {
      const floorDiv = document.createElement("div");
      floorDiv.classList.add("floor");
  
      const controlBtnWrapper = document.createElement("div");
      controlBtnWrapper.classList.add("control-btn-wrapper");
  
      if (i < numberOfFloors || i===1) {
        const upButton = document.createElement("button");
        upButton.classList.add("control-button");
        upButton.textContent = "UP";
        upButton.addEventListener("click", () => requestLift(i, "up"));
        controlBtnWrapper.appendChild(upButton);
      }
  
      if (i > 1) {
        const downButton = document.createElement("button");
        downButton.classList.add("control-button");
        downButton.textContent = "DOWN";
        downButton.addEventListener("click", () => requestLift(i, "down"));
        controlBtnWrapper.appendChild(downButton);
      }
  
      floorDiv.appendChild(controlBtnWrapper);
  
      const floorNumber = document.createElement("div");
      floorNumber.classList.add("floor-number");
      floorNumber.textContent = `Floor ${i}`;
      floorDiv.appendChild(floorNumber);
  
      simulationContainer.appendChild(floorDiv);
    }
  
   
    const liftContainer = document.createElement("div");
    liftContainer.classList.add("lift-container");
  
    const floorHeight = 100;
    const totalHeight = floorHeight * numberOfFloors;
    liftContainer.style.height = `${totalHeight}px`;
    liftContainer.style.width=`${60*numberOfLifts  +numberOfLifts*2}px`;
    for (let i = 1; i <= numberOfLifts; i++) {
      const liftDiv = document.createElement("div");
      liftDiv.classList.add("lift");
      liftDiv.style.transition = "transform 2s linear";
      liftDiv.id = `lift-${i}`;
  
      const leftDoor = document.createElement("div");
      leftDoor.classList.add("lift__door", "lift__door-left");
      const rightDoor = document.createElement("div");
      rightDoor.classList.add("lift__door", "lift__door-right");
  
      liftDiv.appendChild(leftDoor);
      liftDiv.appendChild(rightDoor);
  
      const liftWidth = 50;
      const totalWidth = simulationContainer.clientWidth - 40;
      console.log("kunjesh with-----",liftWidth*numberOfLifts);
      const liftw=60*numberOfLifts ;
      const spacing = totalWidth / (numberOfLifts + 1)+2;
     
      liftDiv.style.left = `${spacing * i - liftWidth / 2}px`;
      liftContainer.appendChild(liftDiv);    
      // liftContainer.style.width=`${liftw}px`;
  
      const liftStateObj = {
        id: `lift-${i}`,
        currentFloor: 1,
        targetFloor: null,
        moving: false,
        direction: null,
        element: liftDiv,
        requestedFloors: new Set(),
      };
      lifts.push(liftStateObj);
    }
  
    simulationContainer.appendChild(liftContainer);
  }
  
 function requestLift(floor, direction) {
     
         console.log("come requset",floor,direction);

          const availableLift =  findNearestAvailableLift(floor,direction);
         console.log("finde lift ",availableLift);
        
          if (availableLift) {
            if (availableLift.currentFloor !== floor) {
              availableLift.targetFloor = floor;
              availableLift.direction = direction;
              availableLift.requestedFloors.add(floor);
              moveLift(availableLift);
            } else {
              openLiftDoors(availableLift);
            }
          } else {
            console.log("lift requserque");
            
            liftRequestQueue.push({ floor, direction });
          }
  }


  
  function findNearestAvailableLift(floor,direction) {
    let nearestLift = null;
    let shortestDistance = Infinity;
  
    for (const lift of lifts) {
      console.log("curent flore ",lift);
      console.log("diraction ---",!lift.direction === false ? lift.direction === direction:"f"  ," ===",lift.direction !== direction);
      const ans= !lift.direction === false ? lift.direction === direction:"f"
      if(lift.targetFloor !== floor  )
      {  
        console.log(" in ");
           if (!lift.moving) {
            const distance = Math.abs(lift.currentFloor - floor);
            if (distance < shortestDistance) {
              shortestDistance = distance;
              nearestLift = lift;

              
            }
          }
    }else{
      if(!lift.direction === false && lift.direction !== direction)
      {  console.log(lift.direction,"====" ,direction);
      
        console.log("continue");        
        continue;
      }
      lift.direction =direction;
      console.log("lift--id",lift);
      return lift;
    }
    }
    if (nearestLift !== null ) {
      nearestLift.targetFloor = floor;
      nearestLift.direction = direction;
    } 
    console.log("lift--id2",nearestLift);
    return nearestLift;
  }
  
  function openLiftDoors(lift) {
    lift.doorsOperating = true;
    lift.element.classList.add("doors-open");
  
    setTimeout(() => {
      lift.element.classList.remove("doors-open");
    console.log("door oprn");
    
      setTimeout(() => {
        lift.doorsOperating = false;
        
        console.log(lift,"door oprn11111111111");
        lift.direction=null;
        console.log(lift,"door oprn111111111112");
        
        lift.requestedFloors.delete(lift.currentFloor);
        console.log(lift,"door oprn111111111113");
  
        if (lift.requestedFloors.size > 0) {
          lift.targetFloor = findNextTargetFloor(lift);
      console.log("door oprn9999999999999");

          moveLift(lift);
        } else {
          lift.moving = false;
          lift.direction = null;

          processLiftQueue();
        }
      }, 5000);
    }, 5000);
  }
  
  function moveLift(lift) {
    console.log("moving lift ",lift,"----",lift.doorsOperating);
    
    if (!lift.moving && !lift.doorsOperating) {
      lift.moving = true;
      moveToNextFloor(lift);
    }
  }
  
  function moveToNextFloor(lift) {
    if (lift.doorsOperating) {
      setTimeout(() => moveToNextFloor(lift), 100);
      return;
    }
  
    const currentFloor = lift.currentFloor;
    const targetFloor = lift.targetFloor;
  
    if (currentFloor === targetFloor) {
      openLiftDoors(lift);
      return;
    }
  
    const nextFloor =
      currentFloor < targetFloor ? currentFloor + 1 : currentFloor - 1;
    const floorHeight = 100;
    const movement = (nextFloor - 1) * floorHeight;
    console.log("movie 00000000000000000000"+nextFloor,"--",movement);
    
    lift.element.style.transform = `translateY(-${movement}px)`;
  
    setTimeout(() => {
      lift.currentFloor = nextFloor;
      if (lift.requestedFloors.has(nextFloor)) {
        openLiftDoors(lift);
      } else {
        moveToNextFloor(lift);
      }
    }, 2000);
  }
  
  function findNextTargetFloor(lift) {
    const currentFloor = lift.currentFloor;
    const requestedFloors = Array.from(lift.requestedFloors);
  
    if (lift.direction === "up") {
      const floorsAbove = requestedFloors.filter((floor) => floor > currentFloor);
      return floorsAbove.length > 0
        ? Math.min(...floorsAbove)
        : Math.max(...requestedFloors);
    } else if (lift.direction === "down") {
      const floorsBelow = requestedFloors.filter((floor) => floor < currentFloor);
      return floorsBelow.length > 0
        ? Math.max(...floorsBelow)
        : Math.min(...requestedFloors);
    } else {
      return requestedFloors[0];
    }
  }
  
  function processLiftQueue() {
    if (liftRequestQueue.length > 0) {
      const nextRequest = liftRequestQueue.shift();
      const availableLift = findNearestAvailableLift(nextRequest.floor);
  
      if (availableLift) {
        availableLift.targetFloor = nextRequest.floor;
        availableLift.direction = nextRequest.direction;
        availableLift.requestedFloors.add(nextRequest.floor);
        moveLift(availableLift);
      } else {
        liftRequestQueue.unshift(nextRequest);
      }
    }
  }
  



  simulateBtn.addEventListener("click", (event) => {
    event.preventDefault();
  
    const floors = document.getElementById("input-floors-count");
    const lifts = document.getElementById("input-lifts-count");
  
    const numberOfFloors = parseInt(floors.value);
    const numberOfLifts = parseInt(lifts.value) ;
   
  if(!numberOfFloors || numberOfFloors<0)
  {
      alert("enter a vild floors");
      console.log("flore");
      
      return;
  }
  console.log("lift",numberOfLifts);
  
  if( !numberOfLifts && numberOfLifts !== 0 || numberOfLifts<0)
  {
    alert("enter a vild lifts if you not need any lift so enter 0");
    console.log("lifts");
    
    return;
  }

    liftDataStore.floors = numberOfFloors;
    liftDataStore.lifts = numberOfLifts;
   -
    
  
    initializeSimulation(numberOfFloors, numberOfLifts);
  });
  