// Building a React clone

module.exports = {
	addons: [
		{
			options: {
				configureJSX: true,
			}
		}
	]
}


function createElement(type, props, ...children) {
	return {
		type,
		props: {
			...props,
			children: children.map(child =>
				typeof child === "object"
					? child
					: createTextElement(child)
			),
		},
	}
}

function createTextElement(text) {
	return {
		type: "TEXT_ELEMENT",
		props: {
			nodeValue: text,
			children: [],
		},
	}
}

//function render(element, container) {
//	const dom = element.type == "TEXT_ELEMENT" 
//		? document.createTextNode("")
//		: document.createElement(element.type)
//
//	const isProperty = key => key !== "children"
//	Object.keys(element.props)
//		.filter(isProperty)
//		.forEach(name => {
//			dom[name] = element.props[name]
//		})
//
//	element.props.children.forEach(child => 
//		render(child, dom)
//	)
//
//	container.appendChild(dom)
//}

function createDom(fiber) {
    
}

function render(element, container) {
    wipRoot = {
        dom: container,
        props: {
            children: [element],
        },
        alternate: currentRoot,
    }
    deletions = []
    nextUnitOfWork = wipRoot
}    

function commitRoot() {
    // Add nodes to DOM
    deletions.forEach(commitWork)
    commitWork(wipRoot.child)
    currentRoot = wipRoot
    wipRoot = null
}

function commitWork(fiber){
    if(!fiber){
        return
    }
    const domParent = fiber.parent.dom
    //domParent.appendChild(fiber.dom)
    if(fiber.effectTag === "PLACEMENT" && fiber.dom != null){
        domParent.appendChild(fiber.dom)
    } else if(fiber.effectTag === "UPDATE" && fiber.dom != null){
        updateDom(
            fiber.dom,
            fiber.alternate.props,
            fiber.props
        )
    } else if(fiber.effectTag === "DELETION"){
        domParent.removeChild(fiber.dom)
    }
    commitWork(fiber.child)
    commitWork(fiber.sibling)
}

let nextUnitOfWork = null
let currentRoot = null
let wipRoot = null
let deletions = null

function workLoop(deadline) {
	let shouldYield = false

	while(nextUnitOfWork && !shouldYield) {
		nextUnitOfWork = performUnitOWork(nextUnitOfWork)
		shouldYield = deadline.timeRemaining() < 1
	}

    if(!nextUnitOfWorl && wipRoot){
        commitRoot()
    }

	requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

function performUnitOWork(nextUnitOfWork) {
	if(!fiber.dom){
        fiber.dom = createDom(fiber)
    }
    
    if(fiber.parent){
        fiber.parent.dom.appendChild(fiber.dom)
    }

    // Create new fibers
    const elements = fiber.props.children
    reconcileChildren(fiber, elements)

    // next unit of work
    if(fiber.child){
        return fiber.child
    }

    let nextFiber = fiber
    while(nextFiber){
        if(nextFiber.sibling){
            return nextFiber.sibling
        }
        nextFiber = nextFiber.parent
    }
}

function reconcileChildren(wipFiber, elements){
    let index = 0
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child
    let prevSibling = null
    
    while (index < elements.length || oldFiber != null) {
        const element = elements[index]
        let newFiber = null

        const sameType = oldFiber && element && element.type == oldFiber.type

        // If the old fiber and element has the same type, update
        if(sameType){
            newFiber = {
                type: oldFiber.type,
                props: element.props,
                dom: oldFiber.dom,
                parent: wipFiber,
                alternate: oldFiber,
                effectTag: "UPDATE",
            }
        }
        
        // If type is different and a new element is present, add it
        if(element && !sameType){
            newFiber = {
                type: element.type,
                props: element.props,
                dom: null,
                parent: wipFiber,
                alternate: null,
                effectTag: "PLACEMENT",
            }
        }   

        // If the types are different and there's an old fiber, remove it
        if(oldFiber && !sameType){
            oldFiber.effectTag = "DELETION"
            deletions.push(oldFiber)
        }

        if(oldFiber){
            oldFiber = oldFiber.sibling
        }
       // const newFiber = {
       //     type: element.type,
       //     props: element.props,
       //     parent: fiber,
       //     dom: null,
       // }

        if(index === 0){
            fiber.child = newFiber
        } else {
            prevSibling.sibling = newFiber
        }

        prevSibling = newFiber
        index++
    }
}

const Didact = {
	createElement,
	render
}

/** @jsx Didact.createElement */
const element = (
	<div id="foo"><a href="https://megacolorboy.com">mega<strong>color</strong>boy</a></div>
)

console.log(element)

// Root container
const container = document.getElementById("root")

Didact.render(element, container)
