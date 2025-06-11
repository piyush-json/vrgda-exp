"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModal = AppModal;
exports.AppHero = AppHero;
exports.useTransactionToast = useTransactionToast;
exports.ellipsify = ellipsify;
const react_1 = require("react");
const cluster_ui_1 = require("./cluster/cluster-ui");
const sonner_1 = require("sonner");
function AppModal({ children, title, hide, show, submit, submitDisabled, submitLabel }) {
    const dialogRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        if (!dialogRef.current)
            return;
        if (show) {
            dialogRef.current.showModal();
        }
        else {
            dialogRef.current.close();
        }
    }, [show, dialogRef]);
    return (<dialog className='modal' ref={dialogRef}>
      <div className='modal-box space-y-5'>
        <h3 className='font-bold text-lg'>{title}</h3>
        {children}
        <div className='modal-action'>
          <div className='join space-x-2'>
            {submit ? (<button className='btn btn-xs lg:btn-md btn-primary' onClick={submit} disabled={submitDisabled}>
                {submitLabel || 'Save'}
              </button>) : null}
            <button onClick={hide} className='btn'>
              Close
            </button>
          </div>
        </div>
      </div>
    </dialog>);
}
function AppHero({ children, title, subtitle }) {
    return (<div className='hero py-[64px]'>
      <div className='hero-content text-center'>
        <div className='max-w-2xl'>
          {typeof title === 'string' ? (<h1 className='text-5xl font-bold'>{title}</h1>) : (title)}
          {typeof subtitle === 'string' ? (<p className='py-6'>{subtitle}</p>) : (subtitle)}
          {children}
        </div>
      </div>
    </div>);
}
function useTransactionToast() {
    return (signature) => {
        sonner_1.toast.success(<div className={'text-center'}>
        <div className='text-lg'>Transaction sent</div>
        <cluster_ui_1.ExplorerLink path={`tx/${signature}`} label={'View Transaction'} className='btn btn-xs btn-primary'/>
      </div>);
    };
}
function ellipsify(str = '', len = 4) {
    if (str.length > 30) {
        return (str.substring(0, len) + '..' + str.substring(str.length - len, str.length));
    }
    return str;
}
