import Mathf from "./Mathf";
import Quaternion from "./Quaternion";
import Vector3 from "./Vector3";
import Vector4 from "./Vector4";

export default class Matrix4x4 {
    private _data: Float32Array = new Float32Array(16);
  
    public static readonly SIZE = 16;
    public static readonly BYTE_SIZE = this.SIZE * Float32Array.BYTES_PER_ELEMENT;

    constructor(
        m00: number = 1.0, m01: number = 0.0, m02: number = 0.0, m03: number = 0.0,
        m10: number = 0.0, m11: number = 1.0, m12: number = 0.0, m13: number = 0.0,
        m20: number = 0.0, m21: number = 0.0, m22: number = 1.0, m23: number = 0.0,
        m30: number = 0.0, m31: number = 0.0, m32: number = 0.0, m33: number = 1.0
    ) {
      
        this.set(
            m00, m01, m02, m03, 
            m10, m11, m12, m13, 
            m20, m21, m22, m23, 
            m30, m31, m32, m33
        );
    }

    public set(m00: number, m01: number, m02: number, m03: number, 
        m10: number, m11: number, m12: number, m13: number, 
        m20: number, m21: number, m22: number, m23: number, 
        m30: number, m31: number, m32: number, m33: number
    ): void {
        this._data.set([
            m00, m01, m02, m03,
            m10, m11, m12, m13,
            m20, m21, m22, m23,
            m30, m31, m32, m33
        ]);
    }

    public setData(data: Float32Array): void {
        if (!data) {
            throw new Error("Data cannot be null or undefined.");
        }
        this._data = data;
    }
    
    public static get identity(): Matrix4x4 {
        return new Matrix4x4(
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );
    }
    public static get zero(): Matrix4x4 {
        return new Matrix4x4(
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0
        );
    }

    public multiply(m: Matrix4x4){
        return Matrix4x4.multiply(m, this);
    }

    public clone(): Matrix4x4 {
        return new Matrix4x4(
            this._data[0], this._data[1], this._data[2], this._data[3],
            this._data[4], this._data[5], this._data[6], this._data[7],
            this._data[8], this._data[9], this._data[10], this._data[11],
            this._data[12], this._data[13], this._data[14], this._data[15]
        );
    }

    public getTranslation(): Vector3 {
      
        const x = this._data[12];
        const y = this._data[13];
        const z = this._data[14];
        return new Vector3(x, y, z);
    }
    
    public static createTranslationMatrix(t: Vector3): Matrix4x4 {
        return new Matrix4x4(
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            t.x, t.y, t.z, 1
        );
    }

    public static createRotationMatrix(rotation: Quaternion): Matrix4x4 {
        const xx = rotation.x * 2;
        const yy = rotation.y * 2;
        const zz = rotation.z * 2;
        const x_xx = rotation.x * xx;
        const y_yy = rotation.y * yy;
        const z_zz = rotation.z * zz;
        const x_yy = rotation.x * yy;
        const x_zz = rotation.x * zz;
        const y_zz = rotation.y * zz;
        const w_xx = rotation.w * xx;
        const w_yy = rotation.w * yy;
        const w_zz = rotation.w * zz;
    
        return new Matrix4x4(
            1 - (y_yy + z_zz), x_yy + w_zz, x_zz - w_yy, 0,
            x_yy - w_zz, 1 - (x_xx + z_zz), y_zz + w_xx, 0,
            x_zz + w_yy, y_zz - w_xx, 1 - (x_xx + y_yy), 0,
            0, 0, 0, 1
        );
    }

    public static createScaleMatrix(s: Vector3){
        return new Matrix4x4(
            s.x, 0, 0, 0,
            0, s.y, 0, 0,
            0, 0, s.z, 0,
            0, 0, 0, 1
        );
    }

    public static shadowMapping(projectionMatrix: Matrix4x4, viewMatrix: Matrix4x4) {
        return Matrix4x4.multiply(projectionMatrix, viewMatrix);
    }
   
    // public static lookTo(position: Vector3, direction: Vector3, up: Vector3): Matrix4x4 {
    
    //     const zAxis = direction.normalized.negative();
    //     const xAxis = up.cross(zAxis).normalized;
    //     const yAxis = zAxis.cross(xAxis).normalized;


    //     const Tx = -Vector3.dot(xAxis, position);
    //     const Ty = -Vector3.dot(yAxis, position);
    //     const Tz = -Vector3.dot(zAxis, position);

    //     const lookToMatrix = new Matrix4x4(
    //         xAxis.x, yAxis.x, zAxis.x, 0,
    //         xAxis.y, yAxis.y, zAxis.y, 0,
    //         xAxis.z, yAxis.z, zAxis.z, 0,
    //         Tx,      Ty,      Tz,      1
    //     );
    
    //     return lookToMatrix;
    // }

    public static createLookAt(eye: Vector3, target: Vector3, up: Vector3): Matrix4x4 {
        const zAxis = Vector3.normalize(Vector3.subtract(eye, target));
        const xAxis = Vector3.normalize(Vector3.cross(up, zAxis)); 
        const yAxis = Vector3.cross(zAxis, xAxis); 
    
        const Tx = -Vector3.dot(xAxis, eye);
        const Ty = -Vector3.dot(yAxis, eye);
        const Tz = -Vector3.dot(zAxis, eye);
    
        const lookAtMatrix = new Matrix4x4(
            xAxis.x, yAxis.x, zAxis.x, 0,
            xAxis.y, yAxis.y, zAxis.y, 0,
            xAxis.z, yAxis.z, zAxis.z, 0,
            Tx,      Ty,      Tz,      1
        );
    
        return lookAtMatrix;
    }

    public static createPerspective(
        fov: number,
        aspectRatio: number,
        near: number,
        far: number
    ): Matrix4x4 {
     
        const fovRad = Mathf.degToRad(fov);
        const tanHalfFov = Mathf.tan(fovRad / 2);
    
        const zRange = far - near;
    
        const a = 1 / (aspectRatio * tanHalfFov);
        const b = 1 / tanHalfFov;
        const c = (far + near) / zRange;
        const d = (-2 * far * near) / zRange;
    
        return new Matrix4x4(
            a, 0, 0, 0,
            0, b, 0, 0,
            0, 0, c, 1,
            0, 0, d, 0
        );
    }

    public static createOrthographic(
        left: number, right: number,
        bottom: number, top: number,
        near: number, far: number
    ): Matrix4x4 {
        const sX = 2 / (right - left);  
        const sY = 2 / (top - bottom);  
        const sZ = -2 / (far - near); 
    
        const tx = -(right + left) / (right - left); 
        const ty = -(top + bottom) / (top - bottom); 
        const tz = -(far + near) / (far - near); 
    
        return new Matrix4x4(
            sX,  0,   0,   0,
             0, sY,   0,   0,
             0,  0,  sZ,   0,
            tx, ty,  tz,   1
        );
    }
        
    /**
     * Multiplica duas matrizes 4x4 no formato column-major (compatível com WebGL/OpenGL).
     * 
     *  result = lhs * rhs.
     */
    public static multiply(lhs: Matrix4x4, rhs: Matrix4x4): Matrix4x4 {
        const a = lhs.getData(); 
        const b = rhs.getData();
        const r = new Float32Array(16);

        for (let col = 0; col < 4; col++) {
            for (let row = 0; row < 4; row++) {
                let sum = 0;
                for (let k = 0; k < 4; k++) {
                    sum += a[k * 4 + row] * b[col * 4 + k];
                }
                r[col * 4 + row] = sum;
            }
        }
        
        return Matrix4x4.fromF32Array(r);

    }

    

    
    

    public static transpose(m: Matrix4x4): Matrix4x4 {
        const result = Matrix4x4.identity;
        const data = m.getData();
        const r = result.getData();

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                r[i * 4 + j] = data[j * 4 + i];
            }
        }

        return result;
    }
    
    public static inverse(m: Matrix4x4): Matrix4x4 {
        const data = m.getData();
        const identity = Matrix4x4.identity.getData();
        const matrix = new Float32Array(data);
       
        for (let i = 0; i < 4; i++) {
             
            let pivotIndex = i;
            let maxVal = Math.abs(matrix[i * 4 + i]);
    
            for (let j = i + 1; j < 4; j++) {
                const val = Math.abs(matrix[j * 4 + i]);
                if (val > maxVal) {
                    maxVal = val;
                    pivotIndex = j;
                }
            }
    
            if (pivotIndex !== i) {
                for (let k = 0; k < 4; k++) {
                    const temp = matrix[i * 4 + k];
                    matrix[i * 4 + k] = matrix[pivotIndex * 4 + k];
                    matrix[pivotIndex * 4 + k] = temp;
    
                    const tempIdentity = identity[i * 4 + k];
                    identity[i * 4 + k] = identity[pivotIndex * 4 + k];
                    identity[pivotIndex * 4 + k] = tempIdentity;
                }
            }
    
            const pivotValue = matrix[i * 4 + i];
            if (pivotValue === 0) {
                console.error("A matriz não é inversível");
                return Matrix4x4.identity; 
            }
    
            for (let j = 0; j < 4; j++) {
                matrix[i * 4 + j] /= pivotValue;
                identity[i * 4 + j] /= pivotValue;
            }
    
            for (let j = 0; j < 4; j++) {
                if (j !== i) {
                    const factor = matrix[j * 4 + i];
                    for (let k = 0; k < 4; k++) {
                        matrix[j * 4 + k] -= factor * matrix[i * 4 + k];
                        identity[j * 4 + k] -= factor * identity[i * 4 + k];
                    }
                }
            }
        }
    
        return new Matrix4x4(
            identity[0], identity[1], identity[2], identity[3],
            identity[4], identity[5], identity[6], identity[7],
            identity[8], identity[9], identity[10], identity[11],
            identity[12], identity[13], identity[14], identity[15]
        );
    }

    public inverse(): Matrix4x4 {
       return Matrix4x4.inverse(this);
    }

    public static composeMatrix(translation: Vector3, rotation: Quaternion, scale: Vector3): Matrix4x4 {
        const xx = rotation.x * 2.0;
        const yy = rotation.y * 2.0;
        const zz = rotation.z * 2.0;
        const x_xx = rotation.x * xx;
        const y_yy = rotation.y * yy;
        const z_zz = rotation.z * zz;
        const x_yy = rotation.x * yy;
        const x_zz = rotation.x * zz;
        const y_zz = rotation.y * zz;
        const w_xx = rotation.w * xx;
        const w_yy = rotation.w * yy;
        const w_zz = rotation.w * zz;

        return new Matrix4x4(
            scale.x * (1.0 - (y_yy + z_zz)), scale.x * (x_yy + w_zz), scale.x * (x_zz - w_yy), 0.0,
            scale.y * (x_yy - w_zz), scale.y * (1.0 - (x_xx + z_zz)), scale.y * (y_zz + w_xx), 0.0,
            scale.z * (x_zz + w_yy), scale.z * (y_zz - w_xx), scale.z * (1.0 - (x_xx + y_yy)), 0.0,
            translation.x, translation.y, translation.z, 1.0
        );
    }
    
    public multiplyVec4(vec: Vector4): Vector4 {
        const a = this._data; 
    
        // Multiplicação de matriz 4x4 por vetor 4D
        return new Vector4(
            a[0] * vec.x + a[4] * vec.y + a[8] * vec.z + a[12] * vec.w,  // x componente
            a[1] * vec.x + a[5] * vec.y + a[9] * vec.z + a[13] * vec.w,  // y componente
            a[2] * vec.x + a[6] * vec.y + a[10] * vec.z + a[14] * vec.w, // z componente
            a[3] * vec.x + a[7] * vec.y + a[11] * vec.z + a[15] * vec.w  // w componente
        );
    }

    public multiplyQuat(quat: Quaternion): Quaternion {
        const a = this._data; 
    
        // Multiplicação de matriz 4x4 por vetor 4D
        return new Quaternion(
            a[0] * quat.x + a[4] * quat.y + a[8] * quat.z + a[12] * quat.w,  // x componente
            a[1] * quat.x + a[5] * quat.y + a[9] * quat.z + a[13] * quat.w,  // y componente
            a[2] * quat.x + a[6] * quat.y + a[10] * quat.z + a[14] * quat.w, // z componente
            a[3] * quat.x + a[7] * quat.y + a[11] * quat.z + a[15] * quat.w  // w componente
        );
    }
    
    public multiplyVec3(vec: Vector3): Vector3 {
        
        const vec4 = new Vector4(vec.x, vec.y, vec.z, 1.0);
        const result4 = this.multiplyVec4(vec4);
        return new Vector3(result4.x, result4.y, result4.z);
    }

    
    public getData(): Float32Array {
        return this._data;
    }


    
    public static fromF32Array(data: Float32Array): Matrix4x4 {
        const m = new Matrix4x4();
        m.setData(data);
        return m;
    }

   public toString(): string {
        const data = this.getData();
        let result = '';

        // Encontre o comprimento máximo necessário para formatação
        const maxLength = Math.max(...data.map(num => this.formatNumber(num).length));

        for (let i = 0; i < 4; i++) {
            result += `[${this.formatNumber(data[i * 4]).padStart(maxLength, ' ')}, ${this.formatNumber(data[i * 4 + 1]).padStart(maxLength, ' ')}, ${this.formatNumber(data[i * 4 + 2]).padStart(maxLength, ' ')}, ${this.formatNumber(data[i * 4 + 3]).padStart(maxLength, ' ')}]\n`;
        }

        return result;
    }

    private formatNumber(value: number): string {
        // Formate o número com dois dígitos decimais
        const formatted = value.toFixed(2);
        // Adicione sinal + para números positivos e mantenha o sinal para negativos
        return value >= 0 ? `+${formatted}` : formatted;
    }


    public static captureProjection() {
        return Matrix4x4.createPerspective(90, 1.0, 0.1, 10.0);
 
    }
}
