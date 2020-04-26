import { expect } from 'chai';
import 'mocha';
import { parseUserId } from '../../src/lambda/authorization/tokenUtils';

const token1= "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Im5QNHJDc0s5YWRzNjUzdFdLTnQySCJ9.eyJpc3MiOiJodHRwczovL2Rldi1yNDZuMjlsdC5hdXRoMC5jb20vIiwic3ViIjoiZ29vZ2xlLW9hdXRoMnwxMDQzNzg5MjU3NTkyMDkzNDI1MjYiLCJhdWQiOiJ6UTRFWDV5eENheEx0MGVWS3c3RGNJbTVMU3NDT091WiIsImlhdCI6MTU4NzczNDUzNywiZXhwIjoxNTg4MTY2NTM3LCJhdF9oYXNoIjoielZnTmVDYnNYLWdfclRmRHMxWkFiQSIsIm5vbmNlIjoiVWo4WFVwbWFVMnlKd1RmaC5YZ2J3aHU1Rk96SzhJOHkifQ.vLu8-_eMIOvk0ZNC_OqBNCscY0k64Om5VarUuZY_pUD0FgqfB0b4sGMKMM5ga_Nwvl5DgGUq4-UZLvvuJgFFkkqXKNO-OrkhT9M21cQT-PTXrnrfDDJ4HpYJCCXDtkfwpaOLvejAvrz-6MWBmDTUJXdJTgn3luq02TIFVWXba_XqmyzohOTov541cLKJosw5hMOYcsIsNCntBlNYLu7VziVTQZZKTWeD7GhkFb4QBYYmni8lJvl3BbY4m-Kc0G-7UT3mznGxZRgEe5PCjbFZxgM_8qz6-e6Kn9xiTfLVNDEIwWWg83IUcdp2R3yfkHwyiT4sLAcFgUaCF9qTpH1x-w"
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
  