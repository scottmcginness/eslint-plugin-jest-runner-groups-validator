const chai = require('chai');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const { expect } = chai;

chai.use(sinonChai);

const fsReadStub = sinon.stub();

const { readAllowedValues } = proxyquire('../../lib/read', {
  fs: { readFileSync: fsReadStub },
  './memoize': (/** @type {any} */ func) => func
});

describe('read', () => {
  describe('readAllowedValues', () => {
    /** @type {any} */
    let contextUt;

    beforeEach(() => {
      contextUt = {};
      fsReadStub.reset();
    });

    context('when the package.json cannot be read', () => {
      beforeEach(() => {
        fsReadStub.throws('Unable to read package');
      });

      it('returns an empty list', () => {
        const values = readAllowedValues();
        expect(values).to.deep.equal([]);
      });
    });

    context('when the package.json does not have squadGroups', () => {
      beforeEach(() => {
        fsReadStub.returns(JSON.stringify({}));
      });

      it('returns an empty list', () => {
        const values = readAllowedValues();
        expect(values).to.deep.equal([]);
      });
    });

    context('when the package.json has squadGroups', () => {
      it('returns an empty list if they are a number', () => {
        fsReadStub.returns(JSON.stringify({ squadGroups: 123 }));

        const values = readAllowedValues();
        expect(values).to.deep.equal([]);
      });

      it('returns an empty list if they are a string', () => {
        fsReadStub.returns(JSON.stringify({ squadGroups: 'abc' }));

        const values = readAllowedValues();
        expect(values).to.deep.equal([]);
      });

      it('returns an empty list if they are a boolean', () => {
        fsReadStub.returns(JSON.stringify({ squadGroups: true }));

        const values = readAllowedValues();
        expect(values).to.deep.equal([]);
      });

      it('returns the list if they are an array of names', () => {
        fsReadStub.returns(JSON.stringify({ squadGroups: ['Fast'] }));

        const values = readAllowedValues();
        expect(values).to.deep.equal(['Fast']);
      });

      it('returns the list if they are an array of names with duplicates', () => {
        fsReadStub.returns(JSON.stringify({ squadGroups: ['Fast', 'Fast'] }));

        const values = readAllowedValues();
        expect(values).to.deep.equal(['Fast']);
      });

      it('returns the leaves of the object tree if they are an object', () => {
        const squadGroups = {
          Blue: ['Fast', 'Slow'],
          Red: ['Easy', 'Hard'],
          Green: ['Good', 'Bad'],
          Orange: ['Manual', 'Perf'],
          Ignored: {}
        };

        fsReadStub.returns(JSON.stringify({ squadGroups }));

        const values = readAllowedValues();
        expect(values).to.deep.equal(['Fast', 'Slow', 'Easy', 'Hard', 'Good', 'Bad', 'Manual', 'Perf']);
      });

      it('returns the leaves of the object tree if they are an object, allowing for duplicates', () => {
        const squadGroups = {
          Blue: ['Fast', 'Slow'],
          Red: ['Easy', 'Hard'],
          Green: ['Good', 'Bad'],
          Orange: ['Manual', 'Perf', 'Fast', 'Easy'],
          Ignored: {}
        };

        fsReadStub.returns(JSON.stringify({ squadGroups }));

        const values = readAllowedValues();
        expect(values).to.deep.equal(['Fast', 'Slow', 'Easy', 'Hard', 'Good', 'Bad', 'Manual', 'Perf']);
      });
    });

    context('when the package.json has multiGroups and this is the property name', () => {
      beforeEach(() => {
        contextUt.options = [{ propertyName: 'multiGroups' }];
      });

      it('returns an empty list if they are a number', () => {
        fsReadStub.returns(JSON.stringify({ multiGroups: 123 }));

        const values = readAllowedValues(contextUt);
        expect(values).to.deep.equal([]);
      });

      it('returns an empty list if they are a string', () => {
        fsReadStub.returns(JSON.stringify({ multiGroups: 'abc' }));

        const values = readAllowedValues(contextUt);
        expect(values).to.deep.equal([]);
      });

      it('returns an empty list if they are a boolean', () => {
        fsReadStub.returns(JSON.stringify({ multiGroups: true }));

        const values = readAllowedValues(contextUt);
        expect(values).to.deep.equal([]);
      });

      it('returns the list if they are an array of names', () => {
        fsReadStub.returns(JSON.stringify({ multiGroups: ['Fast'] }));

        const values = readAllowedValues(contextUt);
        expect(values).to.deep.equal(['Fast']);
      });

      it('returns the list if they are an array of names including duplicates and extra spaces', () => {
        fsReadStub.returns(JSON.stringify({ multiGroups: ['Fast', 'Fast', 'Perf      '] }));

        const values = readAllowedValues(contextUt);
        expect(values).to.deep.equal(['Fast', 'Perf']);
      });

      it('returns the leaves of the object tree if they are an object', () => {
        const multiGroups = {
          Blue: ['Fast', 'Slow'],
          Red: ['Easy', 'Hard'],
          Green: ['Good', 'Bad'],
          Orange: ['Manual', 'Perf'],
          Ignored: {}
        };

        fsReadStub.returns(JSON.stringify({ multiGroups }));

        const values = readAllowedValues(contextUt);
        expect(values).to.deep.equal(['Fast', 'Slow', 'Easy', 'Hard', 'Good', 'Bad', 'Manual', 'Perf']);
      });

      it('returns the leaves of the object tree if they are an object, allowing for duplicates and extra spaces', () => {
        const multiGroups = {
          Blue: ['Fast', 'Slow'],
          Red: ['Easy', 'Hard'],
          Green: ['Good', 'Bad'],
          Orange: ['Manual', 'Perf       ', 'Fast', 'Easy'],
          Ignored: {}
        };

        fsReadStub.returns(JSON.stringify({ multiGroups }));

        const values = readAllowedValues(contextUt);
        expect(values).to.deep.equal(['Fast', 'Slow', 'Easy', 'Hard', 'Good', 'Bad', 'Manual', 'Perf']);
      });
    });
  });
});
