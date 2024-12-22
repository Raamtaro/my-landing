type EventCallback = (...args: any[]) => any

interface EventCallbackNamespace {
    [eventName: string]: EventCallback[]
}

interface EventCallbacks {
    [namespace: string]: EventCallbackNamespace;
}

interface ResolvedName {
    original: string;
    value: string;
    namespace: string;
}

abstract class EventEmitter 
{
    protected callbacks: EventCallbacks

    constructor() {
        this.callbacks = {
            base: {

            }
        }

    }

    on(_names: string, callback: EventCallback): this | boolean
    {
        // Errors
        if(typeof _names === 'undefined' || _names === '')
        {
            console.warn('wrong names')
            return false
        }

        if(typeof callback === 'undefined')
        {
            console.warn('wrong callback')
            return false
        }

        // Resolve names
        const names = this.resolveNames(_names)

        // Each name
        names.forEach((_name) =>
        {
            // Resolve name
            const name = this.resolveName(_name)

            // Create namespace if not exist
            if(!(this.callbacks[ name.namespace ] instanceof Object))
                this.callbacks[ name.namespace ] = {}

            // Create callback if not exist
            if(!(this.callbacks[ name.namespace ][ name.value ] instanceof Array))
                this.callbacks[ name.namespace ][ name.value ] = []

            // Add callback
            this.callbacks[ name.namespace ][ name.value ].push(callback)
        })

        return this
    }

    trigger(_name: string, _args?: any[]): any
    {
        // Errors
        if(typeof _name === 'undefined' || _name === '')
        {
            console.warn('wrong name')
            return false
        }

        let finalResult: any
        let result: any

        // Default args
        const args = !(_args instanceof Array) ? [] : _args

        // Resolve names (should on have one event)
        const name = this.resolveNames(_name)

        // Resolve name
        const nameObject = this.resolveName(name[ 0 ])

        // Default namespace
        if(nameObject.namespace === 'base')
        {
            // Try to find callback in each namespace
            for(const namespace in this.callbacks)
            {
                if(this.callbacks[ namespace ] instanceof Object && this.callbacks[ namespace ][ nameObject.value ] instanceof Array)
                {
                    this.callbacks[ namespace ][ nameObject.value ].forEach((callback) =>
                    {
                        result = callback.apply(this, args)

                        if(typeof finalResult === 'undefined')
                        {
                            finalResult = result
                        }
                    })
                }
            }
        }

        // Specified namespace
        else if(this.callbacks[ nameObject.namespace ] instanceof Object)
        {
            if(nameObject.value === '')
            {
                console.warn('wrong name')
                return this
            }

            this.callbacks[ nameObject.namespace ][ nameObject.value ].forEach((callback) =>
            {
                result = callback.apply(this, args)

                if(typeof finalResult === 'undefined')
                    finalResult = result
            })
        }

        return finalResult
    }


    resolveNames(_names: string): string[]
    {
        let names = _names
        names = names.replace(/[^a-zA-Z0-9 ,/.]/g, '')
        names = names.replace(/[,/]+/g, ' ')

        return names.split(' ')
        // names = names.split(' ')

        // return names
    }

    resolveName(name: string): ResolvedName
    {
        // const newName = {}
        const parts = name.split('.')

        return {
            original: name,
            value: parts[0],
            namespace: parts.length > 1 && parts[1] !== '' ? parts [1] : 'base'
        }

        // newName.original  = name
        // newName.value     = parts[ 0 ]
        // newName.namespace = 'base' // Base namespace

        // // Specified namespace
        // if(parts.length > 1 && parts[ 1 ] !== '')
        // {
        //     newName.namespace = parts[ 1 ]
        // }

        // return newName
    }
}

export default EventEmitter