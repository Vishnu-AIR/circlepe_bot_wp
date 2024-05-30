class QueueBuffer {
  constructor() {
    this.queues = {};
  }

  contains(phone){
    let i;
    for (i in this.queues){
      
      if(i.includes(phone)){
        console.log(i)
        return i
      }
    }
    return false;
  }

 
  enqueue(sid, str) {
    if (!this.queues[sid]) {
      this.queues[sid] = [];
    }
    
    this.queues[sid].push(str);
  }

  
  dequeue(sid) {
    if (!this.queues[sid] || this.queues[sid].length === 0) {
      return null;
    }
    return this.queues[sid].shift();
  }

  
  isEmpty(sid) {
    if(!this.queues[sid]){
      return false;
    }
    return !this.queues[sid] || this.queues[sid].length === 0;
  }

  
  flush(sid) {
    if (this.queues[sid]) {
      while (this.queues[sid].length > 0) {
        console.log(this.dequeue(sid));
      }
      delete this.queues[sid]; 
    }
  }

  
  getQueue(sid) {
    return this.queues[sid] || [];
  }
}



// myQue = new QueueBuffer();

// myQue.enqueue("123_abc","qwwerer")
// myQue.enqueue("345_xyz","ascdx")
// myQue.enqueue("674_qwsdf","ghsyt")

// console.log(myQue.contains("974"))

//   const myQueue = new SIDQueue();
module.exports = QueueBuffer;

