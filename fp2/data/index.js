// すべての学習データの集約
import lp from './q/lp.js';
import risk from './q/risk.js';
import kinyu from './q/kinyu.js';
import tax from './q/tax.js';
import fd from './q/fd.js';
import sz from './q/sz.js';
import cJn from './cases/jn.js';
import cJk from './cases/jk.js';
import cJh from './cases/jh.js';
import cJs from './cases/js.js';
import cJz from './cases/jz.js';
import lLp from './lessons/lp.js';
import lRisk from './lessons/risk.js';
import lKinyu from './lessons/kinyu.js';
import lTax from './lessons/tax.js';
import lFd from './lessons/fd.js';
import lSz from './lessons/sz.js';
import lJn from './lessons/jn.js';
import lJk from './lessons/jk.js';
import lJh from './lessons/jh.js';
import lJs from './lessons/js.js';
import lJz from './lessons/jz.js';

export const QUESTIONS = [...lp, ...risk, ...kinyu, ...tax, ...fd, ...sz];
export const CASES = [...cJn, ...cJk, ...cJh, ...cJs, ...cJz];
export const LESSONS = [...lLp, ...lRisk, ...lKinyu, ...lTax, ...lFd, ...lSz, ...lJn, ...lJk, ...lJh, ...lJs, ...lJz];
