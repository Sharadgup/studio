/**
 * Represents an employee with their ID and name.
 */
export interface Employee {
  /**
   * The unique identifier of the employee.
   */
  id: string;
  /**
   * The name of the employee.
   */
  name: string;
}

/**
 * Asynchronously retrieves employee information by ID.
 *
 * @param id The ID of the employee to retrieve.
 * @returns A promise that resolves to an Employee object containing the employee's information, or null if not found.
 */
export async function getEmployee(id: string): Promise<Employee | null> {
  // TODO: Implement this by calling an API.
  if (id === 'EMP-001') {
    return {
      id: 'EMP-001',
      name: 'Alice',
    };
  }
  return null;
}
