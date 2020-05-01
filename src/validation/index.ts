import { fabric } from 'fabric';
import { ShapeValidation, ShapeValidationError } from '../types';
import { doesTargetIntersect } from '../components/Canvas';
import { getArea } from '../utils';
import RootStore from '../stores';

const MAX_AREA = 25000;

export default class ValidationManager {
  canvas: fabric.Canvas;
  validations: Function[];

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
    this.validations = [
      this._validateArea,
      this._validateIntersection,
      this._validateOnQuarter,
    ];
  }

  validate(shape: fabric.Object): ShapeValidation {
    const errors = this.validations.map((v: Function) => v(shape))
      .filter((value: ShapeValidationError | null) => value !== null);
    
    return {
      errors,
      isValid: errors.length === 0,
    };
  }

  _validateIntersection(shape: fabric.Object): ShapeValidationError | null {
    if (!doesTargetIntersect(shape)) return null;
    return {
      message: 'Your shape intersects with others',
    };
  }

  _validateArea(shape: fabric.Object): ShapeValidationError | null {
    if (!(getArea(shape) > MAX_AREA)) return null;
    return {
      message: 'Your shape is too large',
    };
  }

  _validateOnQuarter(shape: fabric.Object): ShapeValidationError | null {
    if (shape.containsPoint(RootStore.gameStore.game.quarterLocation as fabric.Point)) return null;
    return {
      message: 'Your shape is not on top of the quarter',
    };
  }
}

let validationManager: ValidationManager;

export const getValidationManager = (): ValidationManager => validationManager;
export const initValidationManager = (canvas: fabric.Canvas) => {
  validationManager = new ValidationManager(canvas);
};