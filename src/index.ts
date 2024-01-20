interface ILender {
  lend(amount: number): boolean;
  getBackMoney(amount: number): void;
}

interface IBorrower {
  borrow(amount: number): boolean;
  returnMoney(amount: number): boolean;
}

abstract class User {
  constructor(public firstName: string, public lastName: string) {}

  abstract getBalance(): number;
}

class Lender extends User implements ILender {
  private balance: number;
  
  constructor(firstName: string, lastName: string, balance: number) {
      super(firstName, lastName);
      this.balance = balance;
  }

  getBalance(): number {
      return this.balance;
  }

  lend(amount: number): boolean {
      if (amount > this.balance) return false;
      this.balance -= amount;
      return true;
  }

  getBackMoney(amount: number): void {
      this.balance += amount;
  }
}

class Borrower extends User implements IBorrower {
  private balance: number;
  
  constructor(firstName: string, lastName: string, balance: number) {
      super(firstName, lastName);
      this.balance = balance;
  }

  getBalance(): number {
      return this.balance;
  }

  borrow(amount: number): boolean {
      this.balance += amount;
      return true;
  }

  returnMoney(amount: number): boolean {
      if (amount > this.balance) return false;
      this.balance -= amount;
      return true;
  }
}

class Bank extends Lender {
  // Bank specific logic can be added here.
}

class TransactionManager {
  private loans: Map<Borrower, Map<Lender, number>> = new Map();

  lendMoney(lender: Lender, borrower: Borrower, amount: number): boolean {
      if (lender.lend(amount)) {
          let borrowerLoans = this.loans.get(borrower);
          if (!borrowerLoans) {
              borrowerLoans = new Map<Lender, number>();
              this.loans.set(borrower, borrowerLoans);
          }
          const currentDebt = borrowerLoans.get(lender) || 0;
          borrowerLoans.set(lender, currentDebt + amount);

          borrower.borrow(amount);
          return true;
      }
      return false;
  }

  repayMoney(borrower: Borrower, lender: Lender, amount: number): boolean {
      const borrowerLoans = this.loans.get(borrower);
      if (!borrowerLoans) return false;

      const currentDebt = borrowerLoans.get(lender) || 0;
      if (amount > currentDebt) return false; // Cannot repay more than the debt

      if (borrower.returnMoney(amount)) {
          lender.getBackMoney(amount);
          borrowerLoans.set(lender, currentDebt - amount);
          
          if (currentDebt - amount === 0) {
              borrowerLoans.delete(lender);
              if (borrowerLoans.size === 0) {
                  this.loans.delete(borrower);
              }
          }
          return true;
      }
      return false;
  }

  getLoans(): string {
      let loansInfo = '';
      this.loans.forEach((borrowerLoans, borrower) => {
          borrowerLoans.forEach((amount, lender) => {
              loansInfo += `${borrower.firstName} owes ${lender.firstName} a total of ${amount}\n`;
          });
      });
      return loansInfo.trim();
  }
}

const john = new Lender('John', 'Doe', 1000);
const vietcombank = new Bank('Vietcombank', 'Bank', 50000);
const peter = new Borrower('Peter', 'Parker', 100);
const transactionManager = new TransactionManager();

if (transactionManager.lendMoney(john, peter, 100)) {
  console.log("John lent money to Peter.");
}

if (transactionManager.lendMoney(vietcombank, peter, 10000)) {
  console.log("John lent money to Peter.");
}

if (transactionManager.repayMoney(peter, vietcombank, 10000)) {
  console.log("Peter repaid money to John.");
}

if (transactionManager.repayMoney(peter, john, 100)) {
  console.log("Peter repaid money to John.");
}

// Print out balances
console.log(`John's balance: ${john.getBalance()}`);
console.log(`Peter's balance: ${peter.getBalance()}`);
console.log(`Vietcombank's balance: ${vietcombank.getBalance()}`);
