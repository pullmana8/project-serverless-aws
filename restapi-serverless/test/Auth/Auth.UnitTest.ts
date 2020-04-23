import { expect } from 'chai';
import 'mocha';
import { parseUserId } from '../../src/lambda/authorization/tokenUtils';

const token1= `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2Rldi1yNDZuMjlsdC5hdXRoMC5jb20vIiwic3ViIjoiZ29vZ2xlLW9hdXRoMnwxMDQzNzg5MjU3NTkyMDkzNDI1MjYiLCJhdWQiOiJNandnRm4ycm9kektNaU5OQjFVSVVHM3l6SlNJWXJRdCIsImlhdCI6MTU4NzY1NTg0OCwiZXhwIjoxNTg4MDg3ODQ4LCJhdF9oYXNoIjoiRFotb3ZxYWtra0ZHVi00Wm41YUdtUSIsIm5vbmNlIjoiS2VIU2ViMnRpaGY1cFUubX5RSXVWdDM3cmNMVFBzQTUifQ.ZwNMlY29ocPxuakBjGp9_tBDEsbMNQYwinTl_zoeJ3g`
const token2= ""
const token3= `eyJhbGciOiJIUzI1NiIsInR5cCI.6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`
describe('parse userId', () => {

    it('should return correct userId', () => {
      const userId = parseUserId(token1)
      expect(userId).to.equal(`google-oauth2|104378925759209342526`);
    });
  
    it('should return null for empty token', () => {
        const userId = parseUserId(token2)
        expect(userId).to.equal(null);
    });

    it('should return null for malformed token', () => {
        const userId = parseUserId(token3)
        expect(userId).to.equal(null);
    });
  
  });
  