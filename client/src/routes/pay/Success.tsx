import React from 'react'
import { Link } from 'react-router-dom';

export const Success = () => {
    return <div>
        <div>
          <h1>Payment status: Success</h1>
        </div>
        <div>
          <Link to={'/'}>
              <button>
                  Back to main page
              </button>
          </Link>
        </div>
    </div>
}