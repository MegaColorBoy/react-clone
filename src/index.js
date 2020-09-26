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
  const dom =
    fiber.type == "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type)

  updateDom(dom, {}, fiber.props)

  return dom
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

let nextUnitOfWork = null
let currentRoot = null
let wipRoot = null
let deletions = null    

// If the key is an event handler
const isEvent = key => key.startsWith("on")
const isProperty = key => key !== "children" && !isEvent(key)
const isNew = (prev, next) => key => prev[key] !== next[key]
const isGone = (prev, next) => key => !(key in next)

function updateDom(dom, prevProps, nextProps){

    // If the event handler is changed, remove it
    Object.keys(prevProps)
        .filter(isEvent)
        .filter(
            key => !(key in nextProps) || isNew(prevProps, nextProps)(key)
        )
        .forEach(name => {
            const eventType = name.toLowerCase().substring(2)
            dom.removeEventListener(eventType, prevProps[name])
        })

    // Add new event handlers
    Object.keys(nextProps)
        .filter(isEvent)
        .filter(isNew(prevProps, nextProps))
        .forEach(name => {
            const eventType = name.toLowerCase().substring(2)
            dom.addEventListener(eventType, nextProps[name])
        })

    // Remove old properties
    Object.keys(prevProps)
        .filter(isProperty)
        .filter(isGone(prevProps, nextProps))
        .forEach(name => {
            dom[name] = ""
        })

    // Set new or changed properties
    Object.keys(nextProps)
        .filter(isProperty)
        .filter(isGone(prevProps, nextProps))
        .forEach(name => {
            dom[name] = nextProps[name]
        })
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
    /*
        If the fiber has a PLACEMENT tag, append the DOM
        node to the node from the parent fiber.
    */
    if(fiber.effectTag === "PLACEMENT" && fiber.dom != null){
        domParent.appendChild(fiber.dom)
    /*
        Compare the props of the old and new fibers.
        Remove the old ones and add the new ones.
    */
    } else if(fiber.effectTag === "UPDATE" && fiber.dom != null){
        updateDom(
            fiber.dom,
            fiber.alternate.props,
            fiber.props
        )
    // Else, remove it 
    } else if(fiber.effectTag === "DELETION"){
        domParent.removeChild(fiber.dom)
    }
    commitWork(fiber.child)
    commitWork(fiber.sibling)
}

function workLoop(deadline) {
	let shouldYield = false

	while(nextUnitOfWork && !shouldYield) {
		nextUnitOfWork = performUnitOWork(nextUnitOfWork)
		shouldYield = deadline.timeRemaining() < 1
	}

    if(!nextUnitOfWork && wipRoot){
        commitRoot()
    }

	requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

function performUnitOWork(fiber) {
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
        } else if(element) {
            prevSibling.sibling = newFiber
        }

        prevSibling = newFiber
        index++
    }
}

const Didact = {
	createElement,
	render,
}

/** @jsx Didact.createElement */
// Root container
const container = document.getElementById("root")

// const element = (
// 	<div id="foo"><a href="https://megacolorboy.com">mega<strong>color</strong>boy</a></div>
// )

const updateValue = e => {
    reRender(e.target.value)
}

const reRender = value => {
    const element = (
        <div>
            <input onInput={updateValue} value={value} />
            <h2>Hello {value}</h2>
        </div>
    )
    Didact.render(element, container)
}

reRender("world!")