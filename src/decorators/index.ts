export function spacing() {
  return function(target: any, propertyKey: string, descriptor: any) {
    if (descriptor === undefined) {
      descriptor = Object.getOwnPropertyDescriptor(target, propertyKey)
    }
    const method = descriptor.value
    descriptor.value = async function() {
      console.log('')
      const result = await method.apply(this, arguments)
      console.log('')
      return result
    }
    return descriptor
  }
}
