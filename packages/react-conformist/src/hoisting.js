import hoistStatics from 'hoist-non-react-statics';

export default function hoistMethods({methods, refName, SourceComponent, TargetComponent}) {
    methods.forEach(name => {
        if (typeof SourceComponent.prototype[name] !== 'function') {
            throw new Error(`Cannot hoist non-function ${name} from ${SourceComponent.displayName || '[Component]'}`);
        }
        TargetComponent.prototype[name] = function(...args) {
            return this.refs[refName][name](...args);
        };
    });
    return hoistStatics(TargetComponent, SourceComponent);
};
