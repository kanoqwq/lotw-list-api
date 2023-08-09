import { ToadScheduler, SimpleIntervalJob, Task } from 'toad-scheduler'
const scheduler = new ToadScheduler()

function createInterval(func: any, seconds: number) {
    const task = new Task('clear cache', func)
    const job = new SimpleIntervalJob({ seconds, }, task)
    scheduler.addSimpleIntervalJob(job)
}
export default createInterval